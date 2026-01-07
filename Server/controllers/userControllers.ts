import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";
import Stripe from "stripe";

//Get user Credits
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    res.json({ success: true, message: user?.credits });
  } catch (error: any) {
    console.error(error.code || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Controller Function to create New Project
export const creatUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;
  try {
    const { initial_prompt } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if(user && user.credits < 5){
      return res.status(403).json({ success: false, message: "Add credits to create more peoject" });
    }
    
    const Project = await prisma.websiteProject.create({
        data: {
            name: initial_prompt.length > 50 ? initial_prompt.substring(0, 47) + '...' : initial_prompt,
            initial_prompt,
            userId
        }
    })

    await prisma.user.update({
       where: {id: userId},
       data: {totalCreation: {increment: 1}}
    })

    await prisma.conversation.create({
        data: {
            role: 'user',
            content: initial_prompt,
            projectId: Project.id
        }
    })

    await prisma.user.update({
       where: {id: userId},
       data: {credits: {decrement: 5}}
    })
    

    res.json({ projectId: Project.id });

    // Enhance user prompt
     const promptEnhanceResponse = await openai.chat.completions.create({
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        {
          "role": "system",
          "content": `You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.
               Enhance this prompt by:
               1. Adding specific design details (layout, color scheme, typography)
               2. Specifying key sections and features
               3. Describing the user experience and interactions
               4. Including modern web design best practices
               5. Mentioning responsive design requirements
               6. Adding any missing but important elements
               Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).`
        },
        {
          "role": "user",
          "content": initial_prompt
        }
      ]
  });

  const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;
  await prisma.conversation.create({
    data: {
      role: 'assistant',
      content: `I've enhanced your prompt to "${enhancedPrompt}"`,
      projectId: Project.id
    }
  })

  await prisma.conversation.create({
    data: {
      role: 'assistant',
      content: 'Now generating your website...',
      projectId: Project.id
    }
  })

  //Generate your website
  const codeGenerationResponse = await openai.chat.completions.create({
    model: "kwaipilot/kat-coder-pro:free",
    messages: [
      {
        "role": "system",
        "content":` You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"
                   CRITICAL REQUIREMENTS:
                   - You MUST output valid HTML ONLY.
                   - Use Tailwind CSS for ALL styling
                   - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                   - Use Tailwind utility classes extensively for styling, -animations, and responsiveness
                   - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
                   - Use modern, beautiful design with great UX using Tailwind classes
                   
                   
                   - Make it responsive using Tailwind responsive classes (sm:, md:, 1g:, xl:)
                   - Use Tailwind animations and transitions (animate-*, transition-*)
                   - Include all necessary meta tags
                   - Use Google Fonts CDN if needed for custom fonts
                   - Use placeholder images from https://placehold.co/600x400
                   - Use Tailwind gradient classes for beautiful backgrounds
                   - Make sure all buttons, cards, and components use Tailwind styling

                   CRITICAL HARD RULES:
                    1. You MUST put ALL output ONLY into message.content.
                    2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
                    3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
                    4. Do NOT include markdown, explanations, notes, or code fences.

                    The HTML should be complete and ready to render as-is with Tailwind CSS.
                   `                
      },
      {
        "role": "user",
        "content": enhancedPrompt || ''
      }
    ]
  });


 const code = codeGenerationResponse.choices[0].message.content || '';

     if(!code) {
       await prisma.conversation.create({
      data: {
         role: 'assistant',
         content: "Unable to generate the code, please try again",
         projectId: Project.id
       }
      })
      await prisma.user.update({
      where: {id: userId},
      data: {credits: {increment: 5}}
      })
      return;
    }

 //Creat version for th eproject
  const version = await prisma.version.create({
   data: {
     code: code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g,'').trim(),
     description: 'Initial prompt',
     projectId: Project.id,    
   }
 })

   await prisma.conversation.create({
    data: {
      role: 'assistant',
      content: "I've created your website! You can now preview it and request any changes.",
      projectId: Project.id
    }
   })

   await prisma.websiteProject.update({
    where: {id: Project.id},
    data: {
      current_code: code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g,'').trim(),
      current_version_index: version.id
    }
   })

  } catch (error: any) {
    await prisma.user.update({
      where: {id: userId},
      data: {credits: {increment: 5}}
    })
    console.error(error.code || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Controller Function to Get A Single User Project
export const getUserProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

  const { projectId } = req.params;

  const project = await prisma.websiteProject.findUnique({
    where: {id: projectId, userId},
    include: {
      conversation: {
        orderBy: {timestamp: 'asc'}
      },
      versions: {
        orderBy: {timestamp: 'asc'}
      }
    }
  })

    res.json({ project });
  } catch (error: any) {
    console.error(error.code || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Controller Function to Get All Users Projects
export const getAllUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

  const projects = await prisma.websiteProject.findMany({
    where: { userId },
    orderBy: {
      updatedAt: 'desc'
    }
  })

    res.json({ projects });
  } catch (error: any) {
    console.error(error.code || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}


// Controller Function to Toggle Project Publish
export const toggleProjectPublish = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { projectId } = req.params;

  const project = await prisma.websiteProject.findUnique({
    where: { id: projectId, userId },
  })

  if(!project){
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  await prisma.websiteProject.update({
    where: { id: projectId },
    data: {
      isPublished: !project.isPublished
    }
  })

  res.json({message: project.isPublished ? 'Project Unpublished': 'Project Published Successfully'})
  } catch (error: any) {
    console.error(error.code || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Controller Function to Purchase Credits
export const purchaseCredits = async (req: Request, res: Response) => {
    try {
      interface plan{
        credits: number,
        amount: number
      }

      const plans={
        basic: {credits: 100, amount: 5},
        pro: {credits: 400, amount: 19},
        enterprise: {credits: 1000, amount: 49},
      }

      const userId = req.userId;
      if (!userId) {
      return res.status(401).json({ message: "Unauthorized", });
      }

      const { planId } = req.body as {planId: keyof typeof plans};
      const origin = req.headers.origin as string;

      const plan: plan = plans[planId];
      if(!plan){
        return res.status(404).json({ success: false, message: 'Invalid plan' });
      }

      const transection = await prisma.transaction.create({
        data: {
          userId: userId!,
          planId: req.body.planId,
          amount: plan.amount,
          credits: plan.credits,
        }
      })

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

      const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/loading`,
        cancel_url: `${origin}/`,
         line_items: [
           {
             price_data: {
              currency: 'usd',
              product_data: {
                name: `AiSiteBuilder - ${plan.credits} credits`
              },
              unit_amount: Math.floor(transection.amount) * 100,
             },
             quantity: 1
           },
         ],
         mode: 'payment',
         metadata: {
          transectionId: transection.id,
          appId: 'ai-site-builder'
         },
         expires_at: Math.floor(Date.now() / 1000) + 30 * 60, //Expire at 30 minutes
      });

      res.json({ payment_link: session.url})

    } catch (error :any) {
       console.error(error.code || error.message);
       res.status(500).json({ success: false, message: error.message });
    }
}



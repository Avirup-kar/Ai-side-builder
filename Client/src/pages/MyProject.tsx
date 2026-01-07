import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { toast } from "sonner";
import api from "@/config/axios";

const MyProject = () => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();


    const deleteProject = async (projectId: string) => {
       try {
          const confirm = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
          if(!confirm) return;
          const { data } = await api.delete(`/api/project/${projectId}`);
          toast.success(data.message);
          const { data: data2 } = await api.get('/api/user/projects')
          setProjects (data2.projects);
          setLoading(false);
       } catch (error :any) {
         toast.error(error?.response?.data?.message || error.message);
         console.log(error); 
       }
    }

    useEffect(() => {
        const fetchProject = async () => {
        try {
           const { data } = await api.get('/api/user/projects')
           setProjects (data.projects);
           setLoading(false);
        } catch (error: any) {
           toast.error(error?.response?.data?.message || error.message);
           console.log(error); 
        }
      }
      fetchProject();
    }, [])
    

  return (
    <>
      <div className="px-4 mt-20 md:px-16 1g:px-24 x1:px-32">
        {loading ? (
            <div className='flex items-center justify-center h-[80vh]'>
               <Loader2Icon className='size-10 animate-spin text-indigo-200'/>
            </div>
        ): projects.length > 0 ? (
            <div className=" py-2 min-h-[80vh]">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-medium text-white">My Project</h1>
                    <button onClick={() => navigate('/')} className='flex items-center gap-2 text-white px-3 sm:px-6 py-1 sm:py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all'>
                        <PlusIcon size={18}/>Create New
                    </button>
                </div>
               <div className="flex flex-wrap gap-3.5">
                   {projects.map((project) => (
                    <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className='relative group w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md group hover:shadow-indigo-700/30 hover:border-indigo-800/80 transition-all duration-300'>
                         <div className='relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800'>
                            
                            {project.current_code ? (
                                  <iframe 
                                    srcDoc={project.current_code}
                                    className='absolute top-0 left-0 w-300 h-200 origin-top-left pointer-events-none'
                                    sandbox='allow-scripts allow-same-origin'
                                    style={{ transform: 'scale(0.25)' }}
                                  />
                            ):(
                             <div className='flex items-center justify-center h-full text-gray-500'>
                                   <p>No Preview</p>
                             </div>
                            )}
                            </div>

                            {/* content */}
                                <div className='p-4 text-white h-46 bg-linear-180 flex flex-col justify-between from-transparent group-hover:from-indigo-950 to-transparent transition-colors'>
                                  <div>
                                   <div className='flex items-start justify-between'>
                                      <h2 className='text-lg font-medium line-clamp-2'>{project.name}</h2>
                                      <button className='px-2.5 py-0.5 mt-1 ml-2 text-xs bg-gray-800 border border-gray-700 rounded-full'>
                                            Website
                                      </button>
                                   </div>
                                   <p className='text-gray-400 mt-1 text-sm line-clamp-2'>
                                       {project.initial_prompt}
                                   </p>
                                  </div>

                                   <div onClick={(e) => e.stopPropagation()} className='flex justify-between items-center'>
                                        <span className="text-gray-500 text-sm">{new Date(project.createdAt).toLocaleDateString()}</span>
                                        <div className="flex gap-3 text-white text-sm">
                                            <div className='flex gap-3 text-white text-sm'>
                                              <button onClick={() => navigate(`/preview/${project.id}`)} className='px-3 py-1.5 rounded-lg bg-white/10 transition-all'>Preview</button>
                                              <button onClick={() => navigate(`/projects/${project.id}`)} className='px-3 py-1.5 rounded-lg bg-white/10 transition-colors'>Open</button>
                                            </div>
                                        </div>
                                   </div>
                                </div>
                         <div onClick={(e) => e.stopPropagation()}>
                           <TrashIcon onClick={() => deleteProject(project.id)} className='text-red-500 absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-xl cursor-pointer transition-all'/>
                         </div>
                    </div> 
                   ))}
               </div>
            </div>
        ):(
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <p className="text-lg text-gray-500">You have no projects yet!</p>
                <button onClick={() => navigate('/')} className='px-6 py-2 mt-4 border-white/50 rounded-xl bg-transparent transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.45)] hover:border-white hover:-translate-y-0.5 active:scale-95'>
                     Create New
                </button>
            </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default MyProject

import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import type { Project } from "../types"
import { ArrowBigDownDashIcon, EyeIcon, EyeOffIcon, FullscreenIcon, LaptopIcon, Loader2Icon, MessageSquareIcon, SaveIcon, SmartphoneIcon, TabletIcon, XIcon } from "lucide-react"
import Sidebar from "../components/Sidebar"
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview"
import { toast } from "sonner"
import api from "@/config/axios"
import { authClient } from "@/lib/auth-client"


const ProjectView = () => {
  
const { projectId } = useParams()
const navigate = useNavigate()
const [project, setProject] = useState<Project | null>(null)
const [loading, setLoading] = useState(true)
const [isGenerating, setIsGenerating] = useState(true)
const [device, setDevice] = useState< 'phone' | 'tablet' | 'desktop'>("desktop")
const [isMenuOpen, setIsMenuOpen] = useState(false)
const [isSaving, setIsSaving] = useState(false)

const {data: session, isPending} = authClient.useSession();
const previewRef = useRef<ProjectPreviewRef>(null);

const fetchProject = async () => {
  
  // try {
  //   const { data } = await api.get(`/api/user/project/${projectId}`)
  //   if(data?.project){
  //    setProject(data.project);
  //    setIsGenerating(data.project?.current_code ? false : true);
  //    setLoading(false);
  //   }
  // } catch (error: any) {
  //     setLoading (false);
  //     toast.error(error?.response?.data?.message || error.message);
  //     console.log(error);  
  // }
}

const saveProject = async () => {
  if(!previewRef.current) return;
  const code = previewRef.current.getCode();
  if(!code) return;
  setIsSaving(true);
  try {
    const { data } = await api.put(`/api/project/save/${projectId}`, {code}); 
    toast.success(data.message);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error.message);
    console.log(error);  
  }finally{
    setIsSaving(false);
  } 
};

//Download code ( index.html )
const downloadCode = () => {
   const code = previewRef.current?.getCode() || project?.current_code;
   if(!code){
    if(isGenerating){
      return;
    }
    return;
   }

   const element = document.createElement('a');
   const file = new Blob([code], { type: "text/html" });
   element.href = URL.createObjectURL(file);
   element.download = 'index.html';
   document.body.appendChild(element);
   element.click();
}


const togglePublish = async () => {
   try {
      const { data } = await api.get(`/api/user/publish-toggle/${projectId}`);
      toast.success(data.message)
      setProject((prev) => prev ? ({...prev, isPublished: !prev.isPublished}) : null)
   }catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
   }
}

useEffect(()=>{
   if(session?.user){
    fetchProject();
   }else if(!isPending && !session?.user){
    navigate("/")
    toast("Please login to view your projects")
   }
},[session?.user])

useEffect(() => {
  if(project && !project.current_code){
    const intervalId = setInterval(fetchProject, 10000);
    return () => clearInterval(intervalId);
  }
}, [project])


  if(loading){
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-violet-200"/>
      </div>
    )
  }
  return project ? (
    <div className='flex flex-col h-screen w-full bg-black text-white'>
      {/* Navbar */}
      <div className='flex max-lg:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar'>
        {/* left */}
        <div className="flex items-center gap-2 sm:min-w-90 text-nowrap">
          <img src="/favicon.svg" alt="logo" onClick={() => navigate('/')} className="h-6 cursor-pointer"/>
          <div className='max-w-64 sm:max-w-xs'>
            <p className='text-sm text-medium capitalize truncate'>{project.name}</p>
            <p className='text-xs text-gray-400 -mt-0.51'>Previewing last saved version</p>
          </div>
          <div className='lg:hidden flex-1 flex justify-end'>
            {isMenuOpen ? <MessageSquareIcon onClick={()=> setIsMenuOpen(false)} className="size-6 cursor-pointer" />
            : <XIcon onClick={()=> setIsMenuOpen (true)} className="size-6 cursor-pointer"/>}
            </div>
        </div>

        {/* middle */}
        <div className='hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md'>
          <SmartphoneIcon onClick={()=> setDevice('phone')} className={`size-6 p-1 rounded cursor-pointer ${device === 'phone' ? "bg-gray-700" : ""}`}/>
          <TabletIcon onClick={()=> setDevice('tablet')} className={`size-6 p-1 rounded cursor-pointer ${device === 'tablet' ? "bg-gray-700" : ""}`}/>
          <LaptopIcon onClick={()=> setDevice('desktop')} className={`hidden lg:block size-6 p-1 rounded cursor-pointer ${device === 'desktop' ? "bg-gray-700" : ""}`}/>    
        </div>

        {/* right */}
        <div className='flex items-center justify-end gap-3 flex-1 text-xs lg:text-sm'>
            <button onClick={saveProject} disabled={isSaving} className='max-lg:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700'>
                   {isSaving ? <Loader2Icon className="animate-spin" size={16}/> : <SaveIcon size={16}/>} Save
            </button>
            <Link className='flex items-center gap-2 px-4 py-1 rounded sm:rounded-sm border border-gray-700 hover:border-gray-500 transition-colors' target="_blank" to={`/preview/${projectId}`}>
              <FullscreenIcon size={16}/> Preview
            </Link>
            <button onClick={downloadCode} className='bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors'>
             <ArrowBigDownDashIcon size={16}/> Download
            </button>
            <button onClick={togglePublish} className='bg-linear-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors'>
              {project.isPublished ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>} Publish
            </button>
        </div>
      </div>
      

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
         <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={(p) => setProject(p)} isGenerating={isGenerating} setIsGenerating={setIsGenerating}/>
         <div className="flex-1 p-2 pl-0">
          <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device}/>
         </div>
      </div>

    </div>
  ) 
  :
  (
     <div className='flex items-center justify-center h-screen'>
         <p className="text-2x1 font-medium text-gray-200">Unable to load project!</p>
     </div>
  )
}

export default ProjectView


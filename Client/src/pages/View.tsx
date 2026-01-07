import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import { toast } from "sonner";
import api from "@/config/axios";

const View = () => {

  const { projectId } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchCode = async () => {
    try {
        const { data } = await api.get(`/api/project/preview/${projectId}`);
        setCode(data.project.current_code);
        setLoading(false);
    } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message);
        console.log(error); 
    }
  }
    fetchCode()
  }, [])
  
  if(loading){
    return (
    <div className="w-full h-screen flex justify-center items-center">
      <Loader2Icon className="text-7 animate-spin text-indigo-200"/>
    </div>
  )
  }

  return (
    <div className="h-screen">
      {code && <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false}/>}
    </div>
  )
}

export default View

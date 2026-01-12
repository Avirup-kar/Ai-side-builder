import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/config/axios";
import { authClient } from "@/lib/auth-client";

const Preview = () => {
  const { projectId, versionId } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const {data: session, isPending} = authClient.useSession()
 
  
  useEffect(() => {
    if(!isPending && session?.user){
        const fetchCode = async () => {
           try {
               const { data } = await api.get(`/api/project/preview/${projectId}`);
               setCode(data.project.current_code);
               if(versionId){
                data.project.versions.forEach((version: Version) => {
                  if(version.id === versionId){
                    setCode(version.code);
                  }
                })
               }
               setLoading(false);
            } catch (error: any) {
               toast.error(error?.response?.data?.message || error.message);
               console.log(error); 
            }
        }
   fetchCode()
    }
  }, [session?.user])
  
  if(loading){
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader2Icon className="text-8 animate-spin text-indigo-200"/>
      </div>
    )
  }

  return (
    <div className="h-screen">
      {code && <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false}/>}
    </div>
  )
}

export default Preview

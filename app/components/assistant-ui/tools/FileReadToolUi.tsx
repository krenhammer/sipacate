import { makeAssistantToolUI } from "@assistant-ui/react";  
import { EyeIcon } from "lucide-react"; // or your preferred icon library  
  
// Define the arguments your file read tool expects  
type FileReadArgs = {  
  fileName: string;  
  // Add any other arguments your tool needs  
};  
  
// Define the result your file read tool returns  
type FileReadResult = {  
  content: string;  
  // Add any other result properties  
};  
  
export const FileReadToolUI = makeAssistantToolUI<FileReadArgs, FileReadResult>({  
  toolName: "file_read", // Use the exact name of your tool in VoltAgent/Desktop Commander  
  render: ({ args, status, result }) => {  
    const handleViewClick = () => {  
      // If you have the file content in the result  
      if (result && result.content) {  
        // Show the content in a modal or other UI component  
        // For example:  
        window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(result.content)}`, '_blank');  
      }  
    };  
    
    return (  
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>  
        <span>{args.fileName}</span>  
        <button   
          onClick={handleViewClick}  
          disabled={status.type !== "complete"}  
          style={{   
            background: "none",   
            border: "none",   
            cursor: status.type === "complete" ? "pointer" : "default",  
            opacity: status.type === "complete" ? 1 : 0.5,  
            display: "flex",  
            alignItems: "center",  
            padding: "4px"  
          }}  
        >  
          <EyeIcon size={16} />  
        </button>  
        {status.type === "running" && <span>Reading file...</span>}  
      </div>  
    );  
  },  
});
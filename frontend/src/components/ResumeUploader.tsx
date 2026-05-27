import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { motion } from "framer-motion";

interface ResumeUploaderProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export default function ResumeUploader({ onFileSelect, disabled = false }: ResumeUploaderProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        disabled,
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                    ${isDragActive 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                <input {...getInputProps()} />
                
                <motion.div
                    animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className={`
                        w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
                        ${isDragActive ? "bg-blue-100 dark:bg-blue-900/40" : "bg-gray-100 dark:bg-gray-700"}
                    `}>
                        {isDragActive ? (
                            <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isDragActive ? "松开文件以上传" : "拖拽简历文件到这里"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                            或者点击选择文件
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            支持 PDF 格式，最大 16MB
                        </p>
                    </div>
                </motion.div>
            </div>

            {fileRejections.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-red-700 dark:text-red-300 font-medium">文件上传失败</p>
                        <p className="text-red-600 dark:text-red-400 text-sm">
                            {fileRejections[0].errors[0].message === "File type must be application/pdf"
                                ? "只支持 PDF 格式文件"
                                : fileRejections[0].errors[0].message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

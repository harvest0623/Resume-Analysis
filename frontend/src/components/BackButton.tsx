import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    label?: string;
}

export default function BackButton({ label = "返回首页" }: BackButtonProps) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl shadow-sm transition-all duration-200 mb-6"
        >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </button>
    );
}

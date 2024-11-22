import {useHandleSignInCallback} from "@logto/react";
import {useNavigate} from "react-router-dom";

export function Callback() {
    const navigate = useNavigate();
    const {isLoading} = useHandleSignInCallback(() => {
        navigate("/")
    });

    if (isLoading) {
        return <div>Redirecting...</div>;
    }

    return null
}
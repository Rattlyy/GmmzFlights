import {
    ChevronsUpDown,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {useLogto, UserInfoResponse} from "@logto/react";
import {baseUrl} from "@/lib/utils.ts";
import {useEffect, useState} from "react";
import md5 from "md5";
import {SiTelegram} from "@icons-pack/react-simple-icons";
import {privateClient} from "@/api/api.ts";
import {z} from "zod";
import {toast} from "sonner";

type User = {
    name: string,
    email: string,
    avatar: string,
}

export default function NavUser() {

    const {isMobile} = useSidebar()
    const {signIn, signOut, isAuthenticated, fetchUserInfo, getAccessToken} = useLogto();
    const [infoResponse, setInfoResponse] = useState<UserInfoResponse>();
    const [accessToken, setAccessToken] = useState<string>();
    const user: User =
        infoResponse ? {
            name: infoResponse.name ? infoResponse.name : "No name...",
            email: infoResponse.email ? infoResponse.email : "No email...",
            avatar: infoResponse.picture ? infoResponse.picture :
                "https://gravatar.com/avatar/" + (infoResponse.email ? md5(infoResponse.email) : "")
        } : {
            name: "Login",
            email: "Unlock advanced features",
            avatar: "/default.jpg",
        }

    useEffect(() => {
        (async () => {
            if (isAuthenticated) {
                const userInfo = await fetchUserInfo();
                setInfoResponse(userInfo);
            }
        })();
    }, [fetchUserInfo, isAuthenticated]);

    useEffect(() => {
        (async () => {
            if (isAuthenticated) {
                setAccessToken(await getAccessToken("https://flights.gmmz.dev/private"));
            }
        })();
    }, [getAccessToken, isAuthenticated]);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name}/>
                                <AvatarFallback className="rounded-lg">GZ</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="start"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name}/>
                                    <AvatarFallback className="rounded-lg">GZ</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            {isAuthenticated ? <>
                                <DropdownMenuItem
                                    onClick={() => accessToken ? telegramAuth(accessToken) : null}>
                                    <SiTelegram/>
                                    Connect to Telegram
                                </DropdownMenuItem>
                            </> : null}

                            <DropdownMenuItem
                                onClick={() => !isAuthenticated ? signIn(baseUrl('auth')) : signOut(baseUrl(''))}>
                                <Sparkles/>
                                {isAuthenticated ? "Sign out" : "Sign in"}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

function telegramAuth(accessToken: string) {
    (async () => {
        const stringSuccess = z.object({
            data: z.string()
        })

        const authKey = await stringSuccess.safeParseAsync(
            (await privateClient.GET("/telegram/code", {
                    headers: {
                        authentication: `Bearer ${accessToken}`
                    }
                })
            ).data);


        if (authKey.success)
            window.open(`https://t.me/gmmzdevbot?start=${authKey.data.data}`, "_blank")
        else toast("Error", {
            description: "Error requesting Telegram Key"
        })
    })()
}

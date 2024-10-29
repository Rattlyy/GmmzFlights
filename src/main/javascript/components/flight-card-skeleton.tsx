"use client"

import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";

export default function FlightCardSkeleton() {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4 pt-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-[80px]"/>
                    <Skeleton className="h-6 w-[80px]"/>
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-[80px]"/>
                    <Skeleton className="h-6 w-[80px]"/>
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-[80px]"/>
                    <Skeleton className="h-6 w-[80px]"/>
                </div>
                <Separator/>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-[80px]"/>
                    <Skeleton className="h-6 w-[80px]"/>
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-[80px]"/>
                    <Skeleton className="h-6 w-[80px]"/>
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-[80px]"/>
                    <Skeleton className="h-6 w-[80px]"/>
                </div>
                <Separator/>
                <Skeleton className="h-5 w-full"/>
                <Skeleton className="h-5 w-full"/>
                <Skeleton className="h-10 w-full"/>
            </CardContent>
        </Card>
    )
}
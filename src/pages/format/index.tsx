import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar/navbar"
import { FormatPage } from "@/components/format/FormatPage"

const Format = () => {
	return (
		<div className="flex flex-col min-h-[100dvh]">
			<Navbar />
			<FormatPage/>
		</div>
	)
}

export default Format;
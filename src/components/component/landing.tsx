import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Navbar from "../navbar/navbar"
import Image from "next/image";

export function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar/>
      <main className="flex-1">
      <section className="w-full py-[60%] md:py-24 lg:py-32 xl:py-72 flex items-center justify-center">
          <div className="container px-4 md:px-6 text-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Transform Your Resume with Ease
                </h1>
                <p className="max-w-[600px] text-muted-foreground mx-auto md:text-xl">
                  Resume Smith helps you format your existing resume into the best layouts, ensuring your skills and
                  experience shine.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <Link
                  href="/format"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  prefetch={false}
                >
                  Get Started
                </Link>
              </div>
            </div>
            {/* <Image
              src="/placeholder.svg"
              alt="Hero"
              className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            /> */}
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Resume Formats</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Find the Perfect Resume Layout</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Resume Smith offers a variety of modern and professional resume templates to help you stand out from
                  the crowd.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Minimalist</CardTitle>
                  <CardDescription>A clean and simple layout that focuses on your key information.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {/* <Image
                    src="images/minimal-resume.png"
                    alt="Minimalist Resume"
                    className="mx-auto aspect-[3/2] overflow-hidden rounded-lg object-cover hover:scale-[170%] duration-200"
                  /> */}
                </CardContent>
                <CardFooter>
                  <Link
                    href="/format"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Browse Templates
                  </Link>
                </CardFooter>
              </Card>
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Modern</CardTitle>
                  <CardDescription>A sleek and contemporary design that highlights your achievements.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {/* <Image
                    src="images/modern-resume.png"
                    alt="Modern Resume"
                    className="mx-auto aspect-[3/2] overflow-hidden rounded-lg object-cover hover:scale-[170%] duration-200"
                  /> */}
                </CardContent>
                <CardFooter>
                  <Link
                    href="/format"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Browse Templates
                  </Link>
                </CardFooter>
              </Card>
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                  <CardDescription>
                    A traditional layout that emphasizes your work experience and skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {/* <Image
                    src="images/jakes-resume.jpeg"
                    alt="Professional Resume"
                    className="mx-auto aspect-[3/2] overflow-hidden rounded-lg object-cover hover:scale-[170%] duration-200"
                  /> */}
                </CardContent>
                <CardFooter>
                  <Link
                    href="/format"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Browse Templates
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Get your resume ready for job search
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Let Resume Smith help you create a professional and eye-catching resume that will impress potential
                employers.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link
                href="/format"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Resume Smith. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  )
}



import Link from "next/link"
import React from 'react';

const Navbar = () => {

	return (
		<header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <ResumeSmithLogo className="h-6 w-6" />
          <span className="sr-only">Resume Smith</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/format" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Format
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            About
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
        </nav>
      </header>
	)

	function ResumeSmithLogo(props: React.SVGProps<SVGSVGElement>) {
		return (
		  <svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		  >
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
			<path d="M9 3v18" />
			<path d="M3 9h18" />
			<path d="M14 14h5" />
			<path d="M14 18h5" />
			<path d="M14 10h5" />
		  </svg>
		)
	  }
}

export default Navbar;
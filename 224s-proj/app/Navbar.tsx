'use client'
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100">
    <Link href="/record" className="btn btn-ghost text-xl active:text-blue-500">
      Record
    </Link>
    <Link href="/upload" className="btn btn-ghost text-xl active:text-blue-500">
      Upload
    </Link>
  </div>
  )
}

export default Navbar;
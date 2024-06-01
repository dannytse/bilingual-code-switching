'use client'
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100">
    <a className="btn btn-ghost text-xl active:text-blue-500">
      <li>
        <Link href="/record">
          <p>Record</p>
        </Link>
      </li>
    </a>
    <a className="btn btn-ghost text-xl active:text-blue-500">
      <li>
        <Link href="/upload">
          <p>Upload File</p>
        </Link>
      </li>
    </a>
  </div>
  )
}

export default Navbar;
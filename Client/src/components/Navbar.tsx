import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/logo.svg';
import { X, MenuIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserButton } from '@daveyplate/better-auth-ui'
import api from "@/config/axios";
import { toast } from "sonner";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const {data: session} = authClient.useSession();

  const links = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "MyProject" },
    { to: "/community", label: "Community" },
    { to: "/pricing", label: "Pricing" },
  ];


  useEffect(() => {
      if(session?.user){
          const getCredits = async () => {
         try {
           const {data} = await api.get('/api/user/credits');
           setCredits(data. message);
         } catch (error: any) {
           toast.error(error?.response?.data?.message || error.message)
           console.log(error);
         }
      };
       getCredits();
      }

  }, [session?.user])

  return (
    <div>
      <nav className="z-50 flex items-center top-0 justify-between fixed w-full py-4 px-4 md:px-16 lg:px-20 xl:px-32 backdrop-blur border-b text-white">
        <Link to="/">
          <img className="w-46" src={logo} alt="" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {links.filter(link => link.to !== "/projects" || session?.user).map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
                  <Link key={to} to={to} className={`relative transition hover:text-slate-300 hover:scale-105 ${isActive ? "text-white" : "text-gray-300"}`}>
                    {label}
                    {/* bottom bar */}
                    <span className={`absolute left-0 -bottom-1 h-0.5 w-full rounded-full bg-white/40 transition-all duration-300
                        ${isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
                    />
                  </Link>
                  );
          })}
        </div>

        <div>
             {!session?.user ? (
              <div onClick={() => navigate('/auth/sign-in')} className="relative group overflow-hidden hidden lg:block bg-white/20 p-0.5 h-10 w-35 rounded-md active:scale-100 hover:scale-105 transition-all duration-300">
                <button className="text-white text-sm bg-linear-to-t from-black/50 to-black h-full w-full rounded transition-all">
                      Get started
                </button>
                <div className="absolute -bottom-12 group-hover:-bottom-10 transition-all duration-200 left-1/2 -z-10 -translate-x-1/2 blur size-14 rounded-full bg-white"></div>
              </div>
             ):(
              <>
              <button className='bg-white/10 mr-2 px-5 py-1.5 text-xs sm:text-sm border text-gray-200 rounded-full'>
              Credits: <span className='text-indigo-300'>{credits}</span>
              </button>
               <UserButton size={'icon'}/>
              </> 
             )      
            }
          <button id="open-menu" className="lg:hidden active:scale-90 transition" onClick={() => setMenuOpen(true)}>
           <MenuIcon />
          </button>
        </div>

      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-100 bg-black/60 text-white backdrop-blur flex flex-col items-center justify-center text-lg gap-8 lg:hidden transition-transform duration-300">
          <Link to="/" className="hover:text-slate-300 transition" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/projects" className="hover:text-slate-300 transition" onClick={() => setMenuOpen(false)}>
            My Project
          </Link>
          <Link to="/community" className="hover:text-slate-300 transition" onClick={() => setMenuOpen(false)}>
            Community
          </Link>
          <Link to="/pricing" className="hover:text-slate-300 transition" onClick={() => setMenuOpen(false)}>
            Pricing
          </Link>

          <button className="active:ring-3 text-black active:ring-white aspect-square size-10 p-1 items-center justify-center bg-slate-100 hover:bg-slate-200 transition rounded-md flex" onClick={() => setMenuOpen(false)}>
            <X />
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;

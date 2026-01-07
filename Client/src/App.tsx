import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Pricing from "./pages/Pricing"
import Project from "./pages/ProjectView"
import MyProject from "./pages/MyProject"
import Preview from "./pages/Preview"
import Community from "./pages/Community"
import View from "./pages/View"
import Navbar from "./components/Navbar"
import { Toaster } from 'sonner'
import AuthPage from "./pages/auth/AuthPage"
import Settings from "./pages/Settings"
import Loading from "./pages/Loading"


const App = () => {

  const { pathname } = useLocation()
  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects' || pathname.startsWith('/view/') || pathname.startsWith('/preview/') || pathname.startsWith('/auth/') || pathname.startsWith('/account/settings') || pathname.startsWith('/loading')

  return (
    <div>
      <Toaster expand={false} />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/projects/:projectId" element={<Project />} />
        <Route path="/projects" element={<MyProject />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/community" element={<Community />} />
        <Route path="/view/:projectId" element={<View />} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="/account/settings" element={<Settings />} />
         <Route path="/loading" element={<Loading />} />
      </Routes>
    </div>
  )
}

export default App

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Heart, Users } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Quick links for common pages
  const quickLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Crowdfunding", path: "/crowdfunding", icon: Heart },
    { name: "Programs", path: "/programs", icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-xl">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-[150px] md:text-[200px] font-black text-primary/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-20 w-20 md:h-24 md:w-24 text-primary animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Page Not Found
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, 
            deleted, or the URL might be incorrect.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="h-5 w-5 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>
          
          {/* Quick links */}
          <div className="border-t pt-8">
            <p className="text-sm text-muted-foreground mb-4">Quick Links</p>
            <div className="flex flex-wrap justify-center gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Programs from "./pages/Programs";
import Impact from "./pages/Impact";
import Blog from "./pages/Blog";
import GetInvolved from "./pages/GetInvolved";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Crowdfunding from "./pages/Crowdfunding";
import CampaignDetail from "./pages/CampaignDetail";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/give" element={<Donate />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track-order" element={<OrderTracking />} />
            <Route path="/crowdfunding" element={<Crowdfunding />} />
            <Route path="/crowdfunding/:slug" element={<CampaignDetail />} />
            <Route path="/campaign/:slug" element={<CampaignDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

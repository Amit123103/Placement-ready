"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Building2, MapPin, Users, Star, ExternalLink, AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  employees: string;
  rating: string;
  description: string;
  applyLink: string;
  logo?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "companies"));
      const data: Company[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Company);
      });
      setCompanies(data);
    } catch (err: any) {
      console.error("Error fetching companies:", err);

      // Fallback mock data
      setCompanies([
        {
          id: "m1",
          name: "Google",
          industry: "Technology",
          location: "Bangalore, India",
          employees: "1,50,000+",
          rating: "4.5",
          description: "A leading multinational technology company specializing in search, cloud computing, and AI.",
          applyLink: "https://careers.google.com",
        },
        {
          id: "m2",
          name: "Microsoft",
          industry: "Technology",
          location: "Hyderabad, India",
          employees: "2,20,000+",
          rating: "4.4",
          description: "A global technology corporation producing software, hardware, and cloud services.",
          applyLink: "https://careers.microsoft.com",
        },
        {
          id: "m3",
          name: "Amazon",
          industry: "E-Commerce / Cloud",
          location: "Bangalore, India",
          employees: "1,50,000+",
          rating: "4.2",
          description: "World's largest e-commerce and cloud computing company, powering businesses with AWS.",
          applyLink: "https://amazon.jobs",
        },
        {
          id: "m4",
          name: "Infosys",
          industry: "IT Services",
          location: "Pune, India",
          employees: "3,00,000+",
          rating: "3.9",
          description: "A global leader in next-generation digital services and consulting.",
          applyLink: "https://www.infosys.com/careers",
        },
        {
          id: "m5",
          name: "TCS",
          industry: "IT Services",
          location: "Mumbai, India",
          employees: "6,00,000+",
          rating: "3.8",
          description: "Tata Consultancy Services is India's largest IT services company with a global presence.",
          applyLink: "https://www.tcs.com/careers",
        },
        {
          id: "m6",
          name: "Flipkart",
          industry: "E-Commerce",
          location: "Bangalore, India",
          employees: "50,000+",
          rating: "4.1",
          description: "India's leading e-commerce marketplace, offering a wide range of products and services.",
          applyLink: "https://www.flipkartcareers.com",
        },
      ]);

      if (err?.message?.includes("Missing or insufficient permissions") || err?.code === "permission-denied") {
        setError("Firebase permissions are missing. Loading mock data. Please update your Firestore Security Rules.");
      } else {
        setError("Could not connect to Firebase database. Loading mock data for now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-12 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Top <span className="text-primary">Companies</span> Hiring
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore companies that actively recruit from campuses. Prepare for their interview processes.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto mb-10"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by company, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </motion.div>

          {error && (
            <Alert variant="default" className="mb-8 border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="glass-card h-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{company.name}</h3>
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                          {company.industry}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                      {company.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-3 text-foreground/50" />
                        {company.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-3 text-foreground/50" />
                        {company.employees} employees
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-4 h-4 mr-3 text-yellow-500" />
                        {company.rating} / 5.0 rating
                      </div>
                    </div>

                    <a
                      href={company.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 group transition-colors"
                    >
                      View Careers
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              ))}

              {filteredCompanies.length === 0 && !error && (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border">
                  {searchTerm ? "No companies match your search." : "No companies listed yet. Check back later!"}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

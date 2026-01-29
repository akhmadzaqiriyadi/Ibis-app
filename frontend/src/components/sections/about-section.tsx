import { CONTENT } from "@/constants/content";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { User, Target, Lightbulb } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <Container>
        <div className="mb-20 text-center">
          <Badge variant="secondary" className="mb-4">
            {CONTENT.about.title}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
            Visi Kami
          </h2>
          <p className="mx-auto max-w-3xl text-xl font-medium text-slate-600">
            &ldquo;{CONTENT.about.vision}&rdquo;
          </p>
        </div>

        {/* Mission Grid */}
        <div className="mb-24">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center sm:text-left">
            Misi Kami
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CONTENT.about.mission.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Target className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-12 text-center">
            Tim Pembina & Pengelola
          </h3>
          
          {/* Leaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {CONTENT.about.team.leaders.map((leader, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto h-40 w-40 rounded-full bg-slate-200 mb-4 overflow-hidden relative">
                   {/* Placeholder for real image */}
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                      <User className="h-16 w-16" />
                   </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {leader.name}
                </h4>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                  {leader.role}
                </p>
              </div>
            ))}
          </div>

          {/* Staff Grid */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center text-blue-600">
              Staff Divisi
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CONTENT.about.team.staff.map((staff, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-slate-200 mb-3 flex items-center justify-center text-slate-400">
                    <User className="h-8 w-8" />
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 leading-tight mb-1">
                    {staff.name}
                  </h5>
                  <p className="text-xs text-slate-500">
                    {staff.role}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mentors Grid */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center text-blue-600">
              Mentor Bisnis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {CONTENT.about.team.mentors.map((mentor, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 group">
                  <div className="h-20 w-20 rounded-full bg-white mb-4 flex items-center justify-center text-blue-600 border border-slate-200 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                    <User className="h-10 w-10" />
                  </div>
                  <h5 className="text-base font-bold text-slate-900 mb-1">
                    {mentor.name}
                  </h5>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                    {mentor.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

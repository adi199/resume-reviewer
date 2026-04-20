import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

// 1. Score Display Component
const ScoreDisplay = ({ node, ...rest }) => {
  // Handle both node-style (A2UI) and direct-style props
  const props = node?.properties || rest;
  const { score, label } = props;
  const scoreInt = parseInt(score) || 0;
  
  let colorClass = "bg-destructive";
  if (scoreInt >= 75) colorClass = "bg-success";
  else if (scoreInt >= 50) colorClass = "bg-warning";

  return (
    <Card className="mb-8 border-none bg-secondary/30 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center w-24 h-24">
             {/* Simple circular representation using CSS for now */}
             <div className="absolute inset-0 rounded-full border-8 border-secondary"></div>
             <div className="z-10 text-3xl font-bold">{scoreInt}%</div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Match Score</h3>
            <div className="text-xl font-bold mb-2">{label}</div>
            <Progress value={scoreInt} className="h-2" indicatorClassName={colorClass} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 2. Skills Analysis Component
const SkillsAnalysis = ({ node, ...rest }) => {
  const props = node?.properties || rest;
  const { skills } = props;
  return (
    <div className="mb-8 animate-slide-up">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Skills Analysis</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <Badge 
            key={i} 
            variant={skill.found ? "default" : "destructive"}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              skill.found ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {skill.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// 3. Insight Card Component (Strengths/Weaknesses)
const InsightCard = ({ node, ...rest }) => {
  const props = node?.properties || rest;
  const { title, description, type } = props;
  
  const icons = {
    strength: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    weakness: <XCircle className="w-5 h-5 text-red-400" />,
    suggestion: <AlertCircle className="w-5 h-5 text-indigo-400" />
  };

  return (
    <Card className="mb-4 border-none bg-secondary/20 hover:bg-secondary/30 transition-colors animate-slide-up">
      <CardContent className="flex items-start gap-4 pt-4">
        <div className="mt-1">{icons[type] || <Info className="w-5 h-5" />}</div>
        <div>
          <div className="font-bold text-sm mb-1">{title}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// 4. Container for sections
const Section = ({ node, children, ...rest }) => {
  const props = node?.properties || rest;
  const { title } = props;
  return (
    <div className="mb-10">
      {title && <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">{title}</h2>}
      {children}
    </div>
  );
};

export const catalog = {
  "ScoreDisplay": ScoreDisplay,
  "SkillsAnalysis": SkillsAnalysis,
  "InsightCard": InsightCard,
  "Section": Section,
  // Standard A2UI mappings can be added here if needed
  "Column": ({ children }) => <div className="flex flex-col gap-4">{children}</div>,
  "Row": ({ children }) => <div className="flex gap-4">{children}</div>,
};

"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryLeader } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

export const CategoryLeaderItem = ({ category }: { category: CategoryLeader }) => {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
    <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <CardTitle className="text-lg text-primary">{category.category}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {t("categoryLeader")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="font-bold">{category.leader.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-card-foreground">{category.leader}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {category.rank_title}
                </Badge>
                <span className="text-sm text-muted-foreground">{category.country}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{category.points.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{t("categoryPoints")}</div>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
);
};

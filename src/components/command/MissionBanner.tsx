import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2 } from "lucide-react";
import { usePlanetState } from "@/lib/game-store";
import { Chip } from "@/components/command/LeftPanel";

/** MISSION STARTED / MISSION COMPLETED banner driven by planetState. */
export function MissionBanner() {
  const { mission, region } = usePlanetState();

  return (
    <AnimatePresence mode="wait">
      {mission && (
        <motion.div
          key={`${mission.id}-${mission.status}`}
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45 }}
          className="holo-panel rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-2">
            {mission.status === "active" ? (
              <Target size={13} className="text-danger animate-pulse" />
            ) : (
              <CheckCircle2 size={13} className="text-success" />
            )}
            <p
              className={`font-display text-[10px] tracking-[0.4em] ${
                mission.status === "active" ? "text-danger" : "text-success"
              }`}
            >
              {mission.status === "active" ? "MISSION STARTED" : "MISSION COMPLETED"}
            </p>
          </div>

          <p className="font-display text-base font-black leading-tight">{mission.name}</p>

          {mission.status === "active" ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip label="REGION" value={`${region.flag} ${mission.regionName}`} />
              <Chip label="YEAR" value={`${mission.year}`} />
              <Chip label="THREAT" value={mission.threat} tone="text-danger" />
              <Chip label="LIVES AT RISK" value={mission.livesAtRisk} tone="text-warning" />
              <Chip label="STATUS" value="IN PROGRESS" tone="text-neon" />
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip
                label="EARTH SCORE"
                value={`${(mission.endAvg ?? 0) - mission.startAvg > 0 ? "+" : ""}${(mission.endAvg ?? 0) - mission.startAvg}`}
                tone={(mission.endAvg ?? 0) >= mission.startAvg ? "text-success" : "text-danger"}
              />
              <Chip
                label="SDG"
                value={`${(mission.sdgDelta ?? 0) > 0 ? "+" : ""}${mission.sdgDelta ?? 0}`}
                tone={(mission.sdgDelta ?? 0) >= 0 ? "text-success" : "text-danger"}
              />
              <Chip label="LIVES SAVED" value={mission.livesSaved ?? "—"} tone="text-success" />
              <Chip label="RESULT" value={mission.outcome ?? "—"} tone="text-neon" />
            </div>
          )}

          <p className="mt-2 text-[11px] text-muted-foreground">Objective: {mission.objective}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

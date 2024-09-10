import { motion, Variants } from "framer-motion";

const variants: Variants = {
  hidden: { opacity: 0, scale: 1, x: 100 },
  enter: { opacity: 1, scale: 1, x: 0 },
  exit: { opacity: 0, scale: 0.9, x: 100 },
};

export function PageCardBase({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      className="isolate grow overflow-hidden md:p-4"
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.15, ease: "backInOut" }}
    >
      {children}
    </motion.main>
  );
}

export function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <PageCardBase>
      <div className="h-full w-full overflow-hidden bg-card shadow-lg md:rounded-lg md:border">
        {children}
      </div>
    </PageCardBase>
  );
}

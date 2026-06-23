import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Target, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import thekinggemsJadeImage from './assets/images/thekinggems_jade_card_1782146508369.jpg';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, r: 0, s: 1 });
  const controls = useAnimation();
  
  const requestRef = useRef<number>();
  const lastUpdateTimeRef = useRef(0);
  
  const audioRefs = useRef<{
    running: HTMLAudioElement | null;
    stop: HTMLAudioElement | null;
    win: HTMLAudioElement | null;
  }>({
    running: null,
    stop: null,
    win: null,
  });

  useEffect(() => {
    audioRefs.current.running = new Audio('https://actions.google.com/sounds/v1/mechanisms/clock_ticking.ogg');
    if (audioRefs.current.running) audioRefs.current.running.loop = true;
    
    audioRefs.current.stop = new Audio('https://actions.google.com/sounds/v1/impacts/heavy_impact.ogg');
    audioRefs.current.win = new Audio('https://actions.google.com/sounds/v1/crowds/crowd_cheering_and_clapping_2.ogg');

    const playPromise = audioRefs.current.running?.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay prevented, will play on next interaction
      });
    }

    const currentAudio = audioRefs.current;
    return () => {
      currentAudio.running?.pause();
      currentAudio.stop?.pause();
      currentAudio.win?.pause();
    };
  }, []);

  const animate = useCallback((time: number) => {
    if (isPlaying) {
      // Use time to create a continuous but erratic fast motion
      const t = time * 0.012; // Double speed
      setPos({
        x: Math.sin(t * 1.3) * 120 + Math.cos(t * 0.8) * 80 + Math.sin(t * 2.1) * 40,
        y: Math.cos(t * 1.5) * 160 + Math.sin(t * 1.1) * 90 + Math.cos(t * 2.4) * 60,
        r: Math.sin(t * 0.9) * 45 + Math.cos(t * 1.4) * 20,
        s: 0.8 + (Math.sin(t * 1.7) * 0.4 + 0.4) // Scale from 0.8 to 1.6
      });
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, animate]);

  const handleStop = () => {
    if (!isPlaying) return;
    
    setIsPlaying(false);
    setHasPlayed(true);

    audioRefs.current.running?.pause();

    if (audioRefs.current.stop) {
      audioRefs.current.stop.currentTime = 0;
      audioRefs.current.stop.play().catch(() => {});
    }

    controls.start({
      x: [0, -15, 15, -15, 15, -8, 8, -4, 4, 0],
      y: [0, 15, -15, 15, -15, 8, -8, 4, -4, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    });

    // Exact 0.0001% Win Condition
    const roll = Math.random();
    const win = roll <= 0.000001; // 0.0001% chance (1 in 1,000,000)
    setIsWin(win);

    if (win) {
      if (audioRefs.current.win) {
        audioRefs.current.win.currentTime = 0;
        audioRefs.current.win.play().catch(() => {});
      }

      // Perfect alignment
      setPos({ x: 0, y: 0, r: 0, s: 1 }); 
      
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#059669', '#34d399']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#059669', '#34d399']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      // Missed alignment calculated perfectly
      const closeMiss = Math.random() < 0.15;
      let finalX = 0, finalY = 0, finalR = 0, finalS = 1;
      
      if (closeMiss) {
        // Very tight near-miss
        finalX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4);
        finalY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4);
        finalR = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 1);
        finalS = 1 + (Math.random() * 0.05 - 0.025);
      } else {
        // Dramatic miss
        finalX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 80 + 20);
        finalY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 80 + 20);
        finalR = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 25 + 5);
        finalS = 0.8 + Math.random() * 0.8;
      }
      setPos({ x: finalX, y: finalY, r: finalR, s: finalS });
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    setHasPlayed(false);
    setIsWin(false);

    if (audioRefs.current.win) {
      audioRefs.current.win.pause();
      audioRefs.current.win.currentTime = 0;
    }
    
    if (audioRefs.current.running) {
      audioRefs.current.running.play().catch(() => {});
    }
  };

  return (
    <motion.div 
      animate={controls}
      className="relative flex flex-col items-center justify-between min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0f2e18] via-[#051409] to-[#000000] overflow-hidden font-sans cursor-pointer select-none touch-none"
      onClick={isPlaying ? handleStop : undefined}
    >
      {/* Decorative stars/particles map via slight noise */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-color-dodge bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      <div className="z-20 text-center mt-8 px-4 pointer-events-none w-full max-w-lg">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-black px-6 py-2 rounded-full font-black text-xs md:text-sm mb-4 shadow-[0_0_20px_rgba(252,246,186,0.6)] border border-[#fbf5b7]"
        >
          👑 BẢN GIỚI HẠN SUPER VIP 👑
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#fcf6ba] to-[#bf953f] mb-3 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] filter tracking-widest w-full leading-tight uppercase font-serif">
          Thẻ Bài Ngọc Nephrite
        </h1>
        <p className="text-[#e2ca76] text-sm md:text-base mb-4 font-medium uppercase tracking-widest">
          Đẳng Cấp Hoàng Gia - Dành Riêng Cho Người Dẫn Đầu
        </p>
        <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-black via-[#3a2c00] to-black px-6 py-2 rounded-md border border-[#bf953f]/50 shadow-[0_0_15px_rgba(191,149,63,0.4)]">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fcf6ba] opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-[#bf953f]"></span>
           </span>
           <span className="text-[#fcf6ba] font-black text-xs uppercase tracking-[0.2em] drop-shadow-md">
             ĐỘ KHÓ HIỆN TẠI: CỰC KỲ KHÓ (0.0001%)
           </span>
        </div>
      </div>

      <div className="relative w-full flex-1 flex flex-col items-center justify-center pointer-events-none pb-20">
        {/* The Target Outline */}
        <div className="relative w-[180px] h-[270px] sm:w-[220px] sm:h-[330px] border-[4px] border-dashed border-[#bf953f]/70 rounded-xl flex flex-col items-center justify-center bg-black/40 backdrop-blur-[4px] shadow-[0_0_50px_rgba(191,149,63,0.25)_inset]">
          <Target className="text-[#bf953f]/40 mb-3" size={48} strokeWidth={1.5} />
          <span className="text-[#bf953f]/40 font-black text-xl tracking-[0.4em] relative z-10 mb-1">KHỚP</span>
          <span className="text-[#bf953f]/40 font-black text-xl tracking-[0.4em] relative z-10">VÀO</span>
          <span className="text-[#bf953f]/40 font-black text-xl tracking-[0.4em] relative z-10 mt-1">ĐÂY</span>
        </div>

        {/* The Moving Image */}
        <div 
          className="absolute w-[180px] h-[270px] sm:w-[220px] sm:h-[330px] rounded-xl shadow-[0_0_60px_rgba(191,149,63,0.5)] overflow-hidden z-20 border-[3px] border-[#fcf6ba]/60"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg) scale(${pos.s})`,
            transition: isPlaying ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <img src={thekinggemsJadeImage} alt="Thekinggems Nephrite Jade Vip" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#bf953f]/20 to-transparent mix-blend-overlay"></div>
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(252,246,186,0.3)] pointer-events-none rounded-xl"></div>
        </div>
      </div>

      <div className="z-20 text-center mb-16 pointer-events-none w-full px-4">
        <AnimatePresence mode="wait">
          {isPlaying && (
            <motion.div
              key="playing-hint"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="inline-flex items-center justify-center gap-2 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/30 text-yellow-50 font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.2)] animate-pulse"
            >
              <span className="text-lg">✨</span> CHẠM MÀN HÌNH ĐỂ THỬ THÁCH NHÂN PHẨM
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Status Popups */}
      <AnimatePresence>
        {hasPlayed && (
           <motion.div 
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:w-[450px] z-50 p-8 rounded-3xl border-2 text-center shadow-[0_30px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl ${
                   isWin 
                     ? 'bg-gradient-to-b from-[#1a1500]/95 to-[#050400]/95 border-[#bf953f] shadow-[0_0_80px_rgba(191,149,63,0.6)]' 
                     : 'bg-[#000000]/90 border-red-900/50'
              }`}
           >
              {isWin ? (
                 <>
                    <Sparkles className="mx-auto text-[#fcf6ba] w-14 h-14 mb-3 animate-pulse drop-shadow-[0_0_10px_rgba(252,246,186,0.8)]" />
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] mb-3 drop-shadow-lg tracking-widest uppercase">ĐỈNH CAO!</h2>
                    <p className="text-[#e2ca76] mb-6 text-base font-medium leading-relaxed">
                       Bạn chính là chủ nhân của <span className="text-[#fcf6ba] font-bold text-lg">Mặt Ngọc Nephrite Luxury</span>! Hãy chụp ngay màn hình tuyệt đẹp này để nhận phần quà đẳng cấp từ chúng tôi!
                    </p>
                 </>
              ) : (
                 <>
                    <h2 className="text-2xl font-black text-[#8b0000] mb-2 uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Chưa Thể Khất Phục!</h2>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed max-w-[280px] mx-auto">
                       Đẳng cấp cần thời gian để minh chứng. Hãy tập trung tinh thần và thử lại để đạt được phần thưởng VIP nhất!
                    </p>
                 </>
              )}
              <button 
                 className={`w-full py-4 rounded-xl font-extrabold flex items-center justify-center gap-2 mx-auto text-sm tracking-widest transition-all active:scale-95 uppercase ${
                    isWin ? "bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] text-black shadow-[0_0_30px_rgba(191,149,63,0.5)] hover:shadow-[0_0_40px_rgba(252,246,186,0.7)]" : "bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 text-red-200 border border-red-700/50"
                 }`}
                 onClick={(e) => { e.stopPropagation(); handleStart(); }}
              >
                 <RotateCcw size={20} />
                 THỬ LẠI LẦN NỮA
              </button>
           </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, RefreshCw, Clock } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import type { SpinReward } from "@/lib/types"
import { SPIN_REWARDS } from "@/lib/achievements-data"

const WheelSegment: React.FC<{ reward: SpinReward; angle: number; index: number }> = ({ reward, angle, index }) => {
  const colors = ["#FFF9C4", "#FFE082", "#FFCA28", "#FFB300", "#FFA000", "#FF8F00"]
  return (
    <div
      className="absolute w-full h-full"
      style={{
        transform: `rotate(${angle}deg)`,
        clipPath: "polygon(50% 50%, 100% 0, 100% 100%)",
      }}
    >
      <div
        className="absolute w-1/2 h-full"
        style={{
          transform: "rotate(45deg)",
          transformOrigin: "0 100%",
          background: `radial-gradient(ellipse at top right, ${colors[(index + 1) % colors.length]}, ${colors[index % colors.length]})`,
        }}
       />
      <div
        className="absolute text-xs font-semibold"
        style={{
          left: "50%",
          top: "15%",
          transform: `rotate(${angle + 45}deg) translate(20px, -50%)`,
          width: '50px',
          textAlign: 'center',
          color: "#422006",
          textShadow: '0px 0px 2px rgba(255,255,255,0.7)',
        }}
      >
        <span className="text-lg">{reward.icon}</span>
        <br />
        {reward.name}
      </div>
    </div>
  )
}

interface SpinWheelProps {
    coins: number;
    setCoins: React.Dispatch<React.SetStateAction<number>>;
}

export function SpinWheel({ coins, setCoins }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<SpinReward | null>(null)
  const [canSpin, setCanSpin] = useState(() => {
    if (typeof window === 'undefined') return true;
    const lastSpin = localStorage.getItem("lastSpinTime")
    if (!lastSpin) return true
    const diff = Date.now() - Number(lastSpin)
    return diff >= 4 * 60 * 60 * 1000
  })
  const [nextSpinTime, setNextSpinTime] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (typeof window !== 'undefined' && !canSpin) {
      const timer = setInterval(() => {
        const now = new Date()
        const lastSpin = new Date(Number(localStorage.getItem("lastSpinTime")))
        const nextSpin = new Date(lastSpin.getTime() + 4 * 60 * 60 * 1000)
        const diff = nextSpin.getTime() - now.getTime()

        if (diff <= 0) {
          setCanSpin(true)
          setNextSpinTime("")
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          setNextSpinTime(`${hours}h ${minutes}m`)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [canSpin])

  const handleSpin = () => {
    if (!canSpin || spinning) return

    setSpinning(true)
    setShowConfetti(false)

    const spinDuration = 5000
    const rotations = 5
    const random = Math.random() * 100
    let cumulativeProbability = 0
    let selectedReward = SPIN_REWARDS[0]

    for (const reward of SPIN_REWARDS) {
      cumulativeProbability += reward.probability
      if (random <= cumulativeProbability) {
        selectedReward = reward
        break
      }
    }

    const segmentAngle = 360 / SPIN_REWARDS.length
    const targetAngle = 360 - (SPIN_REWARDS.indexOf(selectedReward) * segmentAngle) - (segmentAngle / 2);
    const finalAngle = 360 * rotations + targetAngle

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
      wheelRef.current.style.transform = `rotate(${finalAngle}deg)`
    }

    setTimeout(() => {
      setLastSpinResult(selectedReward)
      setSpinning(false)
      setCanSpin(false)
      setShowConfetti(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem("lastSpinTime", Date.now().toString())
      }

      if (selectedReward.type === "coins") {
        setCoins((prev) => prev + selectedReward.value)
      }
    }, spinDuration)
  }

  return (
    <Card className="border-2 border-yellow-200 shadow-xl">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} gravity={0.1} />}
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-accent">
          <Sparkles className="h-6 w-6" />
          Daily Spin Wheel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="relative mx-auto w-64 h-64">
           <div className="absolute inset-0 rounded-full border-8 border-yellow-300 bg-gradient-to-br from-yellow-100 to-orange-100 overflow-hidden shadow-inner">
             <div ref={wheelRef} className="absolute w-full h-full transition-transform duration-5000 ease-out">
                <div className="absolute w-full h-full">
                    {SPIN_REWARDS.map((reward, index) => {
                        const angle = 360 / SPIN_REWARDS.length;
                        return <WheelSegment key={reward.id} reward={reward} angle={angle * index} index={index} />
                    })}
                </div>
            </div>
           </div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-background border-4 border-yellow-400 shadow-md"/>
           <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-600 rotate-180"/>
        </div>
        {lastSpinResult && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg" role="alert">
            <div className="text-4xl mb-2">{lastSpinResult.icon}</div>
            <div className="font-semibold text-green-800">You won: {lastSpinResult.name}!</div>
          </div>
        )}
        <div className="text-center">
          {canSpin ? (
            <Button
              size="lg"
              onClick={handleSpin}
              disabled={spinning}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3"
              aria-label={spinning ? "Spinning..." : "Spin Now"}
            >
              {spinning ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Spin Now!
                </>
              )}
            </Button>
          ) : (
            <div className="text-center">
              <Button disabled variant="outline" className="px-8 py-3 mb-2" aria-label={`Next spin in ${nextSpinTime}`}>
                <Clock className="h-5 w-5 mr-2" />
                Next Spin: {nextSpinTime}
              </Button>
              <p className="text-sm text-muted-foreground">Free spin every 4 hours</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-muted-foreground text-center">Possible Rewards:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {SPIN_REWARDS.map((reward) => (
              <div key={reward.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <span>{reward.icon}</span>
                <span className="text-foreground">{reward.name}</span>
                <span className="text-muted-foreground">({reward.probability}%)</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

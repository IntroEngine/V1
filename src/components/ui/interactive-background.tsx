"use client"

import { useEffect, useRef } from "react"

export function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        let width = window.innerWidth
        let height = window.innerHeight

        // Mouse state
        const cursor = { x: width / 2, y: height / 2 }

        // Configuration
        const config = {
            particleCount: 800,
            colors: ['255, 90, 0'],
            baseSize: 1.5,
            maxSize: 3,
            sphereRadius: 500,     // Large base radius
            rotationSpeed: 0.003,  // Slower rotation
            perspective: 800,
            deformationStrength: 2.0 // Strength of mouse repulsion
        }

        // Particle System
        class Particle {
            // Base Position (The perfect-ish sphere path)
            bx: number = 0
            by: number = 0
            bz: number = 0

            // Offset Position (The deformation)
            ox: number = 0
            oy: number = 0
            oz: number = 0

            // Velocity for spring physics
            vx: number = 0
            vy: number = 0
            vz: number = 0

            // Spherical coords
            theta: number = 0
            phi: number = 0
            radius: number = 0

            size: number = 0
            color: string = ''

            init() {
                this.theta = Math.random() * Math.PI * 2
                this.phi = Math.acos((Math.random() * 2) - 1)

                // IMPERFECT SPHERE: Add noise to the radius (Organic Shape)
                // Variation of ±50px + sine waves for "lumpy" look
                const noise = (Math.random() - 0.5) * 80
                const lumpiness = Math.sin(this.theta * 3) * Math.cos(this.phi * 5) * 40
                this.radius = config.sphereRadius + noise + lumpiness

                this.size = Math.random() * (config.maxSize - config.baseSize) + config.baseSize
                this.color = config.colors[Math.floor(Math.random() * config.colors.length)]

                this.updateBasePosition()
            }

            updateBasePosition() {
                this.bx = this.radius * Math.sin(this.phi) * Math.cos(this.theta)
                this.by = this.radius * Math.sin(this.phi) * Math.sin(this.theta)
                this.bz = this.radius * Math.cos(this.phi)
            }

            rotate(angleY: number, angleX: number) {
                // Rotate base position only
                const cosY = Math.cos(angleY)
                const sinY = Math.sin(angleY)
                const x1 = this.bx * cosY - this.bz * sinY
                const z1 = this.bz * cosY + this.bx * sinY

                const cosX = Math.cos(angleX)
                const sinX = Math.sin(angleX)
                const y1 = this.by * cosX - z1 * sinX
                const z2 = z1 * cosX + this.by * sinX

                this.bx = x1
                this.by = y1
                this.bz = z2
            }

            updatePhysics(cursorX: number, cursorY: number, centerX: number, centerY: number) {
                // 1. Calculate screen position of the particle (approx)
                // We use the base position + offset to check distance
                const currentX = centerX + this.bx + this.ox
                const currentY = centerY + this.by + this.oy

                const dx = cursorX - currentX
                const dy = cursorY - currentY
                const distSq = dx * dx + dy * dy
                const dist = Math.sqrt(distSq)

                // 2. Interaction (Repulsion)
                // Pushes particles away if cursor is close (e.g., within 250px)
                if (dist < 250) {
                    const force = (250 - dist) / 250
                    const angle = Math.atan2(dy, dx)

                    // Push away from mouse
                    this.vx -= Math.cos(angle) * force * config.deformationStrength
                    this.vy -= Math.sin(angle) * force * config.deformationStrength
                }

                // 3. Spring Force (Return to 0 offset)
                // Pulls ox/oy back to 0
                const springK = 0.05 // Stiffness
                const damping = 0.9  // Friction

                this.vx += -this.ox * springK
                this.vy += -this.oy * springK
                this.vz += -this.oz * springK

                this.vx *= damping
                this.vy *= damping
                this.vz *= damping

                this.ox += this.vx
                this.oy += this.vy
                this.oz += this.vz
            }

            draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
                // Final 3D position = Base + Offset
                const x = this.bx + this.ox
                const y = this.by + this.oy
                const z = this.bz + this.oz

                const scale = config.perspective / (config.perspective + z + config.sphereRadius)
                const alpha = Math.max(0.1, Math.min(1, (z + config.sphereRadius) / (1.5 * config.sphereRadius)))

                const projX = centerX + x * scale
                const projY = centerY + y * scale

                ctx.beginPath()
                ctx.arc(projX, projY, this.size * scale, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${this.color}, ${alpha})`
                ctx.fill()
            }
        }

        const particlePool: Particle[] = []

        function initParticles() {
            particlePool.length = 0
            for (let i = 0; i < config.particleCount; i++) {
                const p = new Particle()
                p.init()
                particlePool.push(p)
            }
        }

        const resize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height
        }

        const onMouseMove = (e: MouseEvent) => {
            cursor.x = e.clientX
            cursor.y = e.clientY
        }

        const loop = () => {
            ctx.clearRect(0, 0, width, height)

            // Center of screen
            const centerX = width / 2
            const centerY = height / 2

            particlePool.forEach(p => {
                p.rotate(config.rotationSpeed, config.rotationSpeed * 0.3)
                p.updatePhysics(cursor.x, cursor.y, centerX, centerY)
                p.draw(ctx, centerX, centerY)
            })

            animationFrameId = requestAnimationFrame(loop)
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', onMouseMove)

        resize()
        initParticles()
        loop()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none -z-10"
        />
    )
}

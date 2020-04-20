const HEIGHT = 768
const WIDTH = 680
const RECORD_SPF = 50

export default {
    data() {
        return {
            color: {
                r: 0,
                g: 255,
                b: 0,
                a: 10
            },
            size: 10,
            control: {
                previous: null,
                current: 'paint'
            },
            mouse: {
                start: {
                    x: 0,
                    y: 0
                },
                current: {
                    x: 0,
                    y: 0
                },
                previous: {
                    x: 0,
                    y: 0
                },
                down: false
            },
            c: null,
            ctx: null,
            bc: null,
            back_ctx: null,
            tc: null,
            temp_ctx: null,
            ppts: [],
            restorePoints: [],
            drawingPoint: 0,
            sprayIntervalID: null,
            file_to_import: null,
            recordPoints: [],
            file_to_record: null,
            playing: false,
            playingTimeoutId: null,
            recording: false,
            recordingTimeoutId: null
        }
    },
    mounted() {
        this.c = document.getElementById("canvas")
        this.ctx = this.c.getContext("2d")

        this.bc = document.getElementById("backCanvas")
        this.back_ctx = this.bc.getContext("2d")

        this.tc = document.createElement('canvas')
        this.tc.width = WIDTH
        this.tc.height = HEIGHT
        this.temp_ctx = this.tc.getContext('2d')

        this.updateRestorePoint(true)
        console.log(this.checkFileAPI())
    },
    computed: {
        objectColor() {
            return `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a / 10})`
        },
        objectSize() {
            return `${this.size}px`
        },
        startMouse () {
            return {
                x: this.mouse.start.x,
                y: this.mouse.start.y
            }
        },
        currentMouse () {
            return {
                x: this.mouse.current.x,
                y: this.mouse.current.y
            }
        },
        prevMouse () { 
            return {
                x: this.mouse.previous.x,
                y: this.mouse.previous.y
            }
        }
    },
    methods: {
        checkFileAPI() {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                this.reader = new FileReader()
                return true 
            } else {
                alert('The File APIs are not fully supported by your browser. Fallback required.')
                return false
            }
        },
        onControl(name) {
            // this.storeCurrentPath()
            this.control.previous = this.control.current
            this.control.current = name
            
            this.holdControl()
        },
        holdControl() {
            if(this.control.previous !== this.control.current) {
                this.ctx.beginPath()
            }
        },
        onClear() {
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
            this.back_ctx.clearRect(0, 0, WIDTH, HEIGHT)
        },
        onUndo() {
            this.drawingPoint = Math.max(
                0,
                this.drawingPoint - 1
            )
            this.restoreHistory()
            // setTimeout(() => (
            //     this.updateRestorePoint(false)
            // ), 50)
        },
        onRedo() {
            this.drawingPoint = Math.min(
                this.restorePoints.length - 1,
                this.drawingPoint + 1
            )
            this.restoreHistory()
        },
        handleMouseDown(event) {
            this.mouse.down = true
            this.mouse.start = {
                x: typeof event.offsetX !== 'undefined' ? event.offsetX : event.layerX,
                y: typeof event.offsetY !== 'undefined' ? event.offsetY : event.layerY
            }
            this.mouse.previous = {
                x: typeof event.offsetX !== 'undefined' ? event.offsetX : event.layerX,
                y: typeof event.offsetY !== 'undefined' ? event.offsetY : event.layerY
            }
            this.mouse.current = {
                x: typeof event.offsetX !== 'undefined' ? event.offsetX : event.layerX,
                y: typeof event.offsetY !== 'undefined' ? event.offsetY : event.layerY
            }

            this.startNewPath()
        },
        backupRecentPath() {
            this.ctx.drawImage(this.bc, 0, 0)
            this.back_ctx.clearRect(0, 0, WIDTH, HEIGHT)
        },
        storeCurrentPath() {
            this.back_ctx.drawImage(this.c, 0, 0)
            this.updateRestorePoint(true)
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
            this.temp_ctx.clearRect(0, 0, WIDTH, HEIGHT)
        },
        startNewPath() {
            console.log(this.restorePoints.length)
            console.log(this.drawingPoint)
            if(this.restorePoints.length - this.drawingPoint > 1) {
                for(let i = 1; i <= (this.restorePoints.length - this.drawingPoint); i++) {
                    this.restorePoints.pop()
                }
            }
            if(this.control.current == 'paint' || this.control.current == 'neon') {
                this.ctx.beginPath()
                this.ctx.moveTo(this.prevMouse.x, this.prevMouse.y)
            }
            if(this.control.current == 'neon') {
                this.temp_ctx.beginPath()
                this.temp_ctx.moveTo(this.prevMouse.x, this.prevMouse.y)
            }
        },
        handleMouseUp(event) {
            this.storeCurrentPath()
            if(this.ppts.length) {
                this.ppts = []
            }
            if(this.control.current === 'spray') {
                clearInterval(this.sprayIntervalID)
            }
            if(this.control.current === 'eraser') {
                this.ctx.globalCompositeOperation = "source-over"
            }
            this.mouse.down = false
        },
        updateRestorePoint(willDrawLastpoint) {
            // save restore points
            let imgSrc = this.bc.toDataURL("image/png")
            this.restorePoints.push(imgSrc)
            if(willDrawLastpoint) {
                this.drawingPoint = Math.max(
                    0,
                    this.restorePoints.length - 1)
            }
        },
        handleMouseMove(event) {
            if(this.mouse.down) {
                this.mouse.previous = {
                    x: this.mouse.current.x,
                    y: this.mouse.current.y
                }

                this.mouse.current = {
                    x: typeof event.offsetX !== 'undefined' ? event.offsetX : event.layerX,
                    y: typeof event.offsetY !== 'undefined' ? event.offsetY : event.layerY
                }
                this.draw(event)
            }
        },
        initDrawEnv(context) {
            if(this.control.current !== 'neon') {
                context.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a / 10})`
                context.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a / 10})`
            } else {
                context.fillStyle = `white`
                context.strokeStyle = `white`
            }

            context.lineCap="round"
            context.lineJoin = "round"
            context.lineWidth = this.size
        },
        draw (event) {
            this.initDrawEnv(this.ctx)
            this.initDrawEnv(this.temp_ctx)

            switch(this.control.current) {
                case 'paint':
                    this.drawPath(this.currentMouse)
                    break
                case 'tri':
                    this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
                    this.drawTri(this.startMouse, this.currentMouse)
                    break
                case 'rect':
                    this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
                    this.drawRect(this.startMouse, this.currentMouse)
                    break
                case 'circle':
                    this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
                    this.drawCircle(this.startMouse, this.currentMouse)
                    break
                case 'spray':
                    this.drawSpray(this.currentMouse)
                    this.sprayIntervalID = setInterval(this.drawSpray(this.currentMouse), 50)
                    break
                case 'eraser':
                    this.erase(this.currentMouse)
                    break
                case 'neon':
                    this.drawNeon(this.prevMouse, this.currentMouse)
                    break
                default:
                    break
            }
        },
        drawPath(pos) {
            this.ppts.push(pos)
            
            if (this.ppts.length < 3) {
                let b = this.ppts[0]
                this.ctx.beginPath()
                this.ctx.arc(b.x, b.y, this.ctx.lineWidth / 2, 0, Math.PI * 2, !0)
                this.ctx.fill()
                this.ctx.closePath()
                
                return
            }
            
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
            
            this.ctx.beginPath()
            this.ctx.moveTo(this.ppts[0].x, this.ppts[0].y)
            
            for (var i = 1; i < this.ppts.length - 2; i++) {
                let c = (this.ppts[i].x + this.ppts[i + 1].x) / 2
                let d = (this.ppts[i].y + this.ppts[i + 1].y) / 2
                
                this.ctx.quadraticCurveTo(this.ppts[i].x,
                    this.ppts[i].y, c, d)
            }
            
            this.ctx.quadraticCurveTo(
                this.ppts[i].x,
                this.ppts[i].y,
                this.ppts[i + 1].x,
                this.ppts[i + 1].y
            )
            this.ctx.stroke()
        },
        drawTri(pos1, pos2) {
            this.ctx.beginPath()
            this.ctx.moveTo(
                (pos1.x + pos2.x) /2,
                pos1.y
            )
            this.ctx.lineTo(
                pos1.x,
                pos2.y
            )
            this.ctx.lineTo(
                pos2.x,
                pos2.y
            )
            this.ctx.closePath()
            this.ctx.stroke()
        },
        drawRect(pos1, pos2) {
            this.ctx.strokeRect(pos1.x,
                pos1.y,
                pos2.x - pos1.x,
                pos2.y - pos1.y
            )
        },
        drawCircle(pos1, pos2) {
            this.ctx.beginPath()
            let center = {
                x: (pos1.x + pos2.x) / 2,
                y: (pos1.y + pos2.y) / 2
            }
            this.ctx.arc(
                center.x,
                center.y,
                Math.max(
                    Math.abs(pos2.x - pos1.x) / 2,
                    Math.abs(pos2.y - pos1.y) / 2
                ),
                0, 2 * Math.PI)
            this.ctx.closePath()
            this.ctx.stroke()
        },
        drawSpray(pos) {
            const getRandomOffset = (radius) => {
                let random_angle = Math.random() * (2*Math.PI)
                let random_radius = Math.random() * radius
                
                return {
                    x: Math.cos(random_angle) * random_radius,
                    y: Math.sin(random_angle) * random_radius
                }
            }

            const generateSprayParticles = () => {
                const density = 50
                for (let i = 0; i < density; i++) {
                    let offset = getRandomOffset(this.size)
                    let x = pos.x + offset.x
			        let y = pos.y + offset.y
                    this.ctx.fillRect(x, y, 0.5, 0.5)
                }
            }

            generateSprayParticles()
        },
        drawNeon(pos1, pos2) {
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
            this.ctx.lineWidth = this.size / 2
            this.ppts.push(pos2)
            
            if (this.ppts.length < 3) {
                let b = this.ppts[0]
                this.ctx.beginPath()
                this.ctx.arc(b.x, b.y, this.ctx.lineWidth / 2, 0, Math.PI * 2, !0)
                this.ctx.fill()
                this.ctx.closePath()
                
                return
            }

            this.ctx.beginPath()
            this.ctx.moveTo(this.ppts[0].x, this.ppts[0].y)
            
            for (var i = 1; i < this.ppts.length - 2; i++) {
                let c = (this.ppts[i].x + this.ppts[i + 1].x) / 2
                let d = (this.ppts[i].y + this.ppts[i + 1].y) / 2
                
                this.ctx.quadraticCurveTo(this.ppts[i].x,
                    this.ppts[i].y, c, d)
            }
            
            this.ctx.quadraticCurveTo(
                this.ppts[i].x,
                this.ppts[i].y,
                this.ppts[i + 1].x,
                this.ppts[i + 1].y
            )
            
            this.ctx.shadowColor = `rgba(
                ${Math.floor(this.color.r)},
                ${Math.floor(this.color.g)},
                ${Math.floor(this.color.b)}, ${this.color.a / 10})`
            this.ctx.shadowBlur=this.size * 4
            
            for(let i = 0; i < 4; i++) {
                this.ctx.stroke()
            }

            this.ctx.shadowBlur=0
            this.ctx.shadowOffsetX = 0
            this.ctx.shadowOffsetY = 0
        },
        erase(pos) {
            this.ppts.push(pos)
            
            this.backupRecentPath()
            this.ctx.globalCompositeOperation = "destination-out"

            if (this.ppts.length < 3) {
                let b = this.ppts[0]
                this.ctx.beginPath()
                this.ctx.arc(b.x, b.y, this.ctx.lineWidth / 2, 0, Math.PI * 2, !0)
                this.ctx.fill()
                this.ctx.closePath()
                
                return
            }

            this.ctx.beginPath()
            this.ctx.moveTo(this.ppts[0].x, this.ppts[0].y)
            
            for (var i = 1; i < this.ppts.length - 2; i++) {
                let c = (this.ppts[i].x + this.ppts[i + 1].x) / 2
                let d = (this.ppts[i].y + this.ppts[i + 1].y) / 2
                
                this.ctx.quadraticCurveTo(this.ppts[i].x,
                    this.ppts[i].y, c, d)
            }
            
            this.ctx.quadraticCurveTo(
                this.ppts[i].x,
                this.ppts[i].y,
                this.ppts[i + 1].x,
                this.ppts[i + 1].y
            )
            this.ctx.stroke()
        },
        restoreHistory() {
            let oImg = new Image()

            oImg.onload = () => {
                this.ctx.clearRect(0, 0, WIDTH, HEIGHT)
                this.back_ctx.clearRect(0, 0, WIDTH, HEIGHT)
                this.back_ctx.drawImage(oImg, 0, 0)
            }
            oImg.src = this.restorePoints[this.drawingPoint]
        },
        onSave() {
            let button = document.getElementById('btn-download')
            let dataURL = this.bc.toDataURL('image/png')
            button.href = dataURL
        },
        onExport() {
            let textFile = null
            const makeTextFile = (text) => {
                let data = new Blob([text], {type: "text/plain;charset=utf-8"})
                if (textFile !== null) {
                  window.URL.revokeObjectURL(textFile)
                }
                textFile = window.URL.createObjectURL(data)
                return textFile
            }

            let link = document.getElementById('btn-export')
            link.href = makeTextFile(JSON.stringify(this.restorePoints))
        },
        readFile(e) {
            let files = e.target.files || e.dataTransfer.files
            if (!files.length)
                return
            this.file_to_import = files[0]

            this.reader.onload = (ev) => {
                let output = ev.target.result
                this.restorePoints = JSON.parse(output)
                this.drawingPoint = this.restorePoints.length - 1
                this.restoreHistory()
            }

            this.reader.readAsText(this.file_to_import)
        },
        /**
         * record and play drawing
         */
        recordStart() {
            this.recording = true
            this.recordPoints = []
            const record = () => {
                this.recordingTimeoutId = setTimeout(() => {
                    let dc = document.createElement('canvas')
                    dc.width = WIDTH
                    dc.height = HEIGHT
                    let dcx = dc.getContext('2d')
                    dcx.drawImage(this.c, 0, 0)
                    dcx.drawImage(this.bc, 0, 0)
                    let imgSrc = dc.toDataURL("image/png")
                    this.recordPoints.push(imgSrc)
                    if(this.recording) {
                        record()
                    }
                }, RECORD_SPF)
            }

            record()
        },
        recordStop() {
            this.recording = false
            if(this.recordingTimeoutId !== null) {
                clearTimeout(this.recordingTimeoutId)
            }
        },
        recordSave() {
            this.recordStop()
            let textFile = null
            const makeTextFile = (text) => {
                let data = new Blob([text], {type: "text/plain;charset=utf-8"})
                if (textFile !== null) {
                  window.URL.revokeObjectURL(textFile)
                }
                textFile = window.URL.createObjectURL(data)
                return textFile
            }

            let link = document.getElementById('btn-record-save')
            link.href = makeTextFile(JSON.stringify(this.recordPoints))
            setTimeout(() => {
                this.recordPoints = []
            }, 50)
        },
        readRecordedFile(e) {
            let files = e.target.files || e.dataTransfer.files
            if (!files.length)
                return
            this.file_to_record = files[0]

            this.reader.onload = (ev) => {
                let output = ev.target.result
                this.restorePoints = JSON.parse(output)
                this.drawingPoint = this.restorePoints.length - 1
                this.restoreHistory()
            }

            this.reader.readAsText(this.file_to_record)
        },
        playStart() {
            this.playing = true

            if(!this.restorePoints.length) {
                alert("No record.")
                this.playStop()
                return
            }

            const play = () => {
                this.playingTimeoutId = setTimeout(() => {
                    this.drawingPoint++
                    if(this.drawingPoint == this.restorePoints.length) {
                        this.drawingPoint = 0
                    }
                    this.restoreHistory()
                    if(this.playing) {
                        play()
                    }
                }, RECORD_SPF)
            }

            play()
        },
        playPause() {
            this.playing = !this.playing
        },
        playStop() {
            this.playing = false
            if(this.playingTimeoutId !== null) {
                clearTimeout(this.playingTimeoutId)
            }
            this.drawingPoint = 0
        }
    }
}
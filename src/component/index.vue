<template>
    <div class="component">
        <div class="control-area">
            <div class="area-title">CONTROL:</div>
            <div class="control-section">
                <b-button size="sm" class="control" :variant="control.current == 'paint' ? 'success' : 'secondary'" @click="onControl('paint')">
                    Paint
                </b-button>
                <b-button size="sm" class="control" :variant="control.current == 'spray' ? 'success' : 'secondary'" @click="onControl('spray')">
                    Spray
                </b-button>
                <b-button size="sm" class="control" :variant="control.current == 'neon' ? 'success' : 'secondary'" @click="onControl('neon')">
                    Neon
                </b-button>
                <b-button size="sm" class="control" :variant="control.current == 'tri' ? 'success' : 'secondary'" @click="onControl('tri')">
                    Triangle
                </b-button>
                <b-button size="sm" class="control" :variant="control.current == 'rect' ? 'success' : 'secondary'" @click="onControl('rect')">
                    Rectangle
                </b-button>
                <b-button size="sm" class="control" :variant="control.current == 'circle' ? 'success' : 'secondary'" @click="onControl('circle')">
                    Circle
                </b-button>
                <b-button size="sm" class="control" :variant="control.current == 'eraser' ? 'success' : 'secondary'" @click="onControl('eraser')">
                    Eraser
                </b-button>
            </div>
            <div class="control-section">
                <b-button size="sm" class="control" variant="secondary" @click="onUndo()">
                    UNDO
                </b-button>
                <b-button size="sm" class="control" variant="secondary" @click="onRedo()">
                    REDO
                </b-button>
                <b-button size="sm" class="control" variant="secondary" @click="onClear()">
                    Clear
                </b-button>
            </div>
            <div class="control-section">
                <div class="property-preview">
                    <div class="section-title">EXPORT</div>
                </div>
                <a class="btn control btn-secondary btn-sm" href="#" id="btn-download" download="my-draw.png" @click="onSave()">Download Image</a>
                <a class="btn control btn-secondary btn-sm" href="#" id="btn-export" download="draw-history.drw" @click="onExport()">Export history</a>
            </div>
            <div class="control-section">
                <div class="property-preview">
                    <div class="section-title">IMPORT</div>
                </div>
                <input type="file" @change="readFile" accept=".drw" />
                <div class="play-history">
                    <b-button size="sm" class="control" variant="secondary" @click="onUndo()">
                        Prev
                    </b-button>
                    <span class="history-count">{{drawingPoint}}</span>
                    <b-button size="sm" class="control" variant="secondary" @click="onRedo()">
                        Next
                    </b-button>
                </div>
            </div>
            <div class="control-section">
                <div class="property-preview">
                    <div class="section-title">RECORD</div>
                </div>
                <div class="play-history">
                    <b-button size="sm" class="control"
                        :variant="recording ? 'success' : 'secondary'"
                        @click="recordStart()">
                        Start
                    </b-button>
                    <b-button size="sm" class="control" variant="secondary" @click="recordStop()">
                        Stop
                    </b-button>
                    <a class="btn control btn-secondary btn-sm" href="#"
                        id="btn-record-save" download="record.drw" @click="recordSave()">Save</a>
                </div>
                <div class="property-preview">
                    <div class="section-title">OPEN RECORDED FILE</div>
                </div>
                <input type="file" @change="readRecordedFile" accept=".drw" />
                <div class="play-history">
                    <b-button size="sm" class="control"
                        :variant="playing ? 'success' : 'secondary'"
                        @click="playStart()">
                        Play
                    </b-button>
                    <b-button size="sm" class="control" variant="secondary" @click="playPause()">
                        Pause
                    </b-button>
                    <b-button size="sm" class="control" variant="secondary" @click="playStop()">
                        Stop
                    </b-button>
                </div>
            </div>
            <div class="control-section">
                <div class="property-preview">
                    <div class="section-title">SIZE:</div>
                    <div class="size-preview" :style="{width: objectSize}">
                    </div>
                </div>
                <div class="range-item">
                    <input class="range-slider" type="range" min="1" max="100" v-model="size">
                    <span>{{size}} px</span>
                </div>
            </div>
            <div class="control-section">
                <div class="property-preview">
                    <div class="section-title">COLOR:</div>
                    <div class="color-preview" :style="{backgroundColor: objectColor}">
                    </div>
                </div>
                <div class="range-item">
                    <span>R</span>
                    <input class="range-slider" type="range" min="1" max="255" v-model="color.r">
                    <span>{{color.r}}</span>
                </div>
                <div class="range-item">
                    <span>G</span>
                    <input class="range-slider" type="range" min="1" max="255" v-model="color.g">
                    <span>{{color.g}}</span>
                </div>
                <div class="range-item">
                    <span>B</span>
                    <input class="range-slider" type="range" min="1" max="255" v-model="color.b">
                    <span>{{color.b}}</span>
                </div>
                <div class="range-item">
                    <span>A</span>
                    <input class="range-slider" type="range" min="0" max="10" v-model="color.a">
                    <span>{{color.a / 10}}</span>
                </div>
            </div>
        </div>
        <div class="canvas-area">
            DRAW SOMETHING
            <canvas id="backCanvas"
                height="768"
                width="680"></canvas>
            <canvas id="canvas"
                height="768"
                width="680"
                @mousedown="handleMouseDown"
                @mouseup="handleMouseUp"
                @mousemove="handleMouseMove"></canvas>
        </div>
    </div>
</template>

<script src="./script.js">
</script>

<style lang="scss" src="./styles.scss">
</style>


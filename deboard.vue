<template>
  <v-parallax src="https://media.tenor.com/MGamxKH-C9gAAAAd/blue-archive.gif">
    <v-card color="basil" style="opacity: 0.9; margin-top: 50px;">
      <v-card-title class="text-center justify-center py-6">
        <h1 class="font-weight-bold text-h2 text-basil">
          Deboard
        </h1>
        <div class="text-center">
          <v-progress-circular
            :model-value="displayValue"
            :rotate="360"
            :size="500"
            :width="50"
            color="red"
            :style="{ opacity: isPowerOn ? 1 : 0.5 }"
          >
            <div class="text-h4">
              <div class="text-center">อุณหภูมิ</div>
              <div :class="{ 'text-disabled': !isPowerOn }">{{ displayValue }}°C</div>
            </div>
          </v-progress-circular>

          <v-progress-circular
            :model-value="displayValue"
            :rotate="-90"
            :size="500"
            :width="50"
            color="primary"
            :style="{ opacity: isPowerOn ? 1 : 0.5 }"
          >
            <div class="text-h4">
              <div class="text-center">ความชื้น</div>
              <div :class="{ 'text-disabled': !isPowerOn }">{{ displayValue }}%</div>
            </div>
          </v-progress-circular>
        </div>
         <v-btn-toggle v-model="isPowerOn" color="primary" class="mb-4" mandatory elevation="8">
            <v-btn :value="true" size="x-large" color="success">เปิด</v-btn>
            <v-btn :value="false" size="x-large" color="error">ปิด</v-btn>
          </v-btn-toggle>
      </v-card-title>
      <v-parallax height="300" src="https://cdn.vuetifyjs.com/images/parallax/material.jpg">
        <v-tabs v-model="tab" bg-color="transparent" color="basil" grow>
          <v-tab v-for="item in items" :key="item" :text="item" :value="item"></v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <v-tabs-window-item v-for="item in items" :key="item" :value="item">
            <v-card color="basil" flat>
              <v-card-text>{{ text }}</v-card-text>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-parallax>
    </v-card>
  </v-parallax>
</template>

<script>
// 1. นำเข้าไลบรารี Socket.IO Client
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      value: 0,
      isPowerOn: false,
      tab: 'Appetizers',
      items: ['Appetizers', 'Entrees', 'Deserts', 'Cocktails'],
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    };
  },
  computed: {
    displayValue() {
      // ตัวเลขจะแสดง 0 เมื่อปิด และค่าจริงเมื่อเปิด
      return this.isPowerOn ? this.value : 0;
    },
  },
  watch: {
    // Watch property จะใช้สำหรับกรณีที่ต้องการทำบางอย่างเมื่อ isPowerOn เปลี่ยนแปลง
  },
  methods: {
    // สามารถเพิ่ม methods อื่นๆ ที่ต้องการได้ในอนาคต
  },
  mounted() {
    // 2. สร้างการเชื่อมต่อกับ WebSocket server ที่ Backend
    const socket = io('http://localhost:7000'); 

    // 3. รับข้อมูลอุณหภูมิจาก Backend
    socket.on('อุณหภูมิ', (data) => {
      console.log('Received temperature:', data);
      // อัปเดตค่า value เมื่อได้รับข้อมูล
      if (this.isPowerOn) {
        this.value = parseFloat(data);
      }
    });

    // 4. รับข้อมูลความชื้นจาก Backend
    socket.on('ความชื้น', (data) => {
      console.log('Received humidity:', data);
      // อัปเดตค่า value เมื่อได้รับข้อมูล
      if (this.isPowerOn) {
        this.value = parseFloat(data);
      }
    });
  },
};
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>
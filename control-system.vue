<template>
  <v-parallax src="https://c.tenor.com/JDVSxDHS67kAAAAd/tenor.gif">
    <v-container class="py-10"
      style="margin-top: 100px; background-color: rgba(255, 255, 255, 0.95); border-radius: 20px; box-shadow: 0px 10px 20px rgba(0,0,0,0.2); max-width: 900px;">
      <v-card color="transparent" elevation="0">
        <v-card-title class="text-center justify-center">
          <h1 class="font-weight-bold text-h2 text-primary mb-6">แผงควบคุม</h1> <!-- ชื่อแผงควบคุม -->
        </v-card-title>

        <!-- หลอดไฟ -->
        <v-row justify="center" class="mb-8">
          <v-col cols="12" md="12" class="text-center">
            <v-icon :color="lightStatus === 1 && isPowerOn ? 'yellow' : 'grey lighten-1'" size="100">
              mdi-lightbulb
            </v-icon> <!-- แสดงไอคอนหลอดไฟ เปลี่ยนสีตามสถานะ -->
            <div class="mt-2 text-subtitle-1">หลอดไฟ</div> <!-- ชื่อหลอดไฟ -->
          </v-col>
        </v-row>

        <!-- ปุ่มเปิด/ปิดระบบ -->
        <v-row justify="center" class="mb-8">
          <v-btn-toggle v-model="isPowerOn" color="primary" mandatory elevation="2">
            <v-btn :value="true" size="large" color="success">เปิด</v-btn> <!-- ปุ่มเปิดระบบ -->
            <v-btn :value="false" size="large" color="error">ปิด</v-btn> <!-- ปุ่มปิดระบบ -->
          </v-btn-toggle>
        </v-row>

        <!-- ปุ่มกลับหน้าหลัก -->
        <v-btn
          variant="outlined"
          color="error"
          block
          @click="$router.push('/')"
        >
          <v-icon start>mdi-logout</v-icon>
          กลับไปหน้าหลัก <!-- ปุ่มนำทางกลับหน้าหลัก -->
        </v-btn>

        <!-- พื้นหลัง Parallax + Tabs -->
        <v-parallax height="250" src="https://cdn.vuetifyjs.com/images/parallax/material.jpg" class="mb-6"
          style="border-radius: 12px; overflow: hidden;">
          <v-tabs v-model="tab" bg-color="rgba(0,0,0,0.4)" color="white" grow>
            <v-tab v-for="item in items" :key="item" :text="item" :value="item" /> <!-- แสดงแท็บ -->
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item v-for="item in items" :key="item" :value="item">
              <v-card color="transparent" flat class="pa-4">
                <v-card-text class="text-white text-body-1">{{ text }}</v-card-text> <!-- เนื้อหาของแต่ละแท็บ -->
              </v-card>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-parallax>
      </v-card>
    </v-container>
  </v-parallax>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      socket: null, // เก็บการเชื่อมต่อ Socket.IO
      isPowerOn: false, // สถานะเปิด/ปิดระบบ
      lightStatus: 0, // สถานะหลอดไฟ (0 = ปิด, 1 = เปิด)
      tab: 'Appetizers', // แท็บเริ่มต้น
      items: ['Appetizers', 'Entrees', 'Deserts', 'Cocktails'], // รายชื่อแท็บ
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', // เนื้อหาแท็บตัวอย่าง
    };
  },
  mounted() {
    this.socket = io('http://localhost:7000'); // เชื่อมต่อ backend ผ่าน Socket.IO

    // ✅ รับค่า 0/1 จาก backend (ส่งมาจาก MQTT)
    this.socket.on('สวิตไฟ', (data) => {
      this.lightStatus = parseInt(data); 
      console.log("📥 ได้ค่าหลอดไฟจาก backend:", this.lightStatus); // แสดงค่าหลอดไฟที่รับ
    });
  },

  watch: {
    // ส่งสถานะหลอดไฟไป backend ทุกครั้งที่ lightStatus เปลี่ยน
    lightStatus(newVal) {
      if (this.isPowerOn && this.socket) {
        this.socket.emit('update_light', newVal);
        console.log("ส่งสถานะหลอดไฟไปยัง backend:", newVal);
      }
    },
    // ส่งสถานะระบบ (0=ปิด, 1=เปิด) ไป backend ทุกครั้งที่ isPowerOn เปลี่ยน
    isPowerOn(newVal) {
      if (this.socket) {
        const powerValue = newVal ? 1 : 0;
        this.socket.emit('update_power', powerValue);
        console.log("ส่งสถานะระบบไปยัง backend:", powerValue);
      }
    }
  },
  
};

</script>

<style scoped>
.v-progress-circular {
  margin: 1rem; /* สำหรับการแสดง loading ถ้ามี */
}
</style>

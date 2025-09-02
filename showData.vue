<template>
  <v-container class="py-6">
    <v-card elevation="2" class="rounded-lg">
      <!-- Toolbar -->
      <v-toolbar flat class="rounded-t-lg" style="background: linear-gradient(to right, #e0f7fa, #ffffff);">
        <v-toolbar-title class="text-blue-grey-darken-3 font-weight-bold">
          <v-icon start color="blue-grey-darken-2" size="20">mdi-account-group</v-icon>
          รายชื่อสมาชิก
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn style="background: #26c6da; color: white;" rounded="lg" prepend-icon="mdi-plus" @click="add">
          เพิ่มสมาชิก
        </v-btn>
      </v-toolbar>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="books"
        class="elevation-0"
        :hide-default-footer="books.length < 11"
        density="comfortable"
        height="500"
        fixed-header
      >
        <template v-slot:item.pic="{ item }">
          <v-avatar size="50">
            <v-img :src="`http://localhost:7000/uploads/${item.pic}`" />
          </v-avatar>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon color="blue" @click="edit(item.id)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" @click="remove(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <v-alert type="warning" text class="my-4">ไม่มีข้อมูลสมาชิก</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="text-blue-grey-darken-2 font-weight-bold">
          <v-icon start color="primary">mdi-account-edit</v-icon>
          {{ isEditing ? "แก้ไขสมาชิก" : "เพิ่มสมาชิกใหม่" }}
        </v-card-title>
        <v-divider class="mb-4" />
        <v-form>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="record.email" label="อีเมล" outlined dense required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="record.password" label="รหัสผ่าน" type="password" outlined dense required />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="record.status"
                :items="['0', '1']"
                label="สถานะ (0 = ยังไม่ยืนยัน, 1 = ยืนยันแล้ว)"
                outlined
                dense
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="record.dep" label="แผนก" outlined dense required />
            </v-col>
            <v-col cols="12">
              <v-img
                v-if="record.pic"
                :src="`http://localhost:7000/uploads/${record.pic}`"
                max-width="100"
                class="mb-2 rounded"
              />
              <v-file-input
                label="เลือกรูปโปรไฟล์"
                accept="image/*"
                prepend-icon="mdi-camera"
                outlined
                dense
                @change="onDialogFileChange($event)"
              />
            </v-col>
          </v-row>
        </v-form>
        <v-card-actions class="justify-end">
          <v-btn variant="text" color="grey" @click="dialog = false">ยกเลิก</v-btn>
          <v-btn style="background: #26c6da; color: white;" @click="save">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      books: [],
      record: { id: "", email: "", password: "", status: "", dep: "", pic: "" },
      dialog: false,
      isEditing: false,
      dialogFile: null,
      headers: [
        { text: "รหัส", value: "id" },
        { text: "อีเมล", value: "email" },
        { text: "รหัสผ่าน", value: "password" },
        { text: "สถานะ", value: "status" },
        { text: "แผนก", value: "dep" },
        { text: "รูปภาพ", value: "pic" },
        { text: "การจัดการ", value: "actions", sortable: false },
      ],
    };
  },
  computed: {
    isEditing() {
      return !!this.record.id;
    },
  },
  async mounted() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:7000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.books = response.data.users || [];
      } catch (err) {
        console.error("Fetch error:", err);
      }
    },
    onDialogFileChange(file) {
      if (file instanceof Event) this.dialogFile = file.target?.files?.[0] || null;
      else if (file instanceof File) this.dialogFile = file;
      else if (Array.isArray(file) && file.length > 0) this.dialogFile = file[0];
      else this.dialogFile = null;
    },
    add() {
      this.record = { id: "", email: "", password: "", status: "", dep: "", pic: "" };
      this.dialog = true;
    },
    edit(id) {
      const found = this.books.find((b) => b.id === id);
      if (found) this.record = { ...found };
      this.dialog = true;
    },
    async remove(id) {
      try {
        await axios.delete(`http://localhost:7000/delete-user/${id}`);
        await this.fetchUsers();
      } catch (err) {
        console.error("Delete error:", err);
      }
    },
    async save() {
      try {
        const formData = new FormData();
        formData.append("email", this.record.email);
        formData.append("password", this.record.password);
        formData.append("status", this.record.status);
        formData.append("dep", this.record.dep);
        if (this.dialogFile) formData.append("photo", this.dialogFile);
        else formData.append("photoName", this.record.pic);

        const url = this.isEditing
          ? `http://localhost:7000/edit-user/${this.record.id}`
          : `http://localhost:7000/insert`;

        await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
        this.dialog = false;
        this.dialogFile = null;
        await this.fetchUsers();
      } catch (err) {
        console.error("Save error:", err);
      }
    },
  },
};
</script>

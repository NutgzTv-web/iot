<template>
  <v-sheet
    class="p-4"
    color="#f5f7fa"
    style="min-height: 100vh;"
  >
    <v-data-table
      :headers="headers"
      :items="books"
      class="rounded-lg elevation-1 bg-white"
      :hide-default-footer="books.length < 11"
      density="comfortable"
    >
      <!-- Toolbar -->
      <template v-slot:top>
        <v-toolbar flat class="rounded-lg mb-4" color="blue-grey-lighten-5">
          <v-icon color="blue-grey-darken-2" icon="mdi-book"></v-icon>
          <v-toolbar-title class="text-blue-grey-darken-3 font-weight-bold ml-2">
            Book Manager
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn
            color="blue-grey-darken-1"
            prepend-icon="mdi-plus"
            rounded="lg"
            variant="tonal"
            @click="add"
          >
            Add Book
          </v-btn>
        </v-toolbar>
        <v-btn
          variant="outlined"
          color="error"
          block
          @click="$router.push('/')"
        >
          <v-icon start>mdi-logout</v-icon>
          กลับไปหน้าหลัก
        </v-btn>
      </template>

      <!-- Status -->
      <template v-slot:item.status="{ value }">
        <v-chip
          :color="value === 'good' ? 'green-lighten-2' : 'red-lighten-2'"
          text-color="black"
          size="small"
          label
        >
          {{ value }}
        </v-chip>
      </template>

      <!-- Actions -->
      <template v-slot:item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="blue-grey-darken-1"
            variant="text"
            @click="edit(item.id)"
          ></v-btn>

          <v-btn
            icon="mdi-delete"
            size="small"
            color="red-lighten-1"
            variant="text"
            @click="remove(item.id)"
          ></v-btn>
        </div>
      </template>

      <!-- No data -->
      <template v-slot:no-data>
        <v-btn
          prepend-icon="mdi-backup-restore"
          text="Reset Data"
          color="blue-grey-darken-1"
          variant="outlined"
          @click="reset"
        ></v-btn>
      </template>
    </v-data-table>
  </v-sheet>

  <!-- Dialog -->
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="text-blue-grey-darken-2 font-weight-bold">
        {{ isEditing ? 'Edit Book' : 'Add Book' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.email"
              label="Email"
              variant="outlined"
              density="comfortable"
              color="blue-grey"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.password"
              label="Password"
              variant="outlined"
              density="comfortable"
              color="blue-grey"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.status"
              label="Status"
              variant="outlined"
              density="comfortable"
              color="blue-grey"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.dep"
              label="Department"
              variant="outlined"
              density="comfortable"
              color="blue-grey"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="dialog = false">Cancel</v-btn>
        <v-btn color="blue-grey-darken-1" variant="flat" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, shallowRef, computed } from 'vue'

function createNewRecord() {
  return {
    id: '',
    email: '',
    password: '',
    status: '',
    dep: ''
  }
}

const books = ref([])
const formModel = ref(createNewRecord())
const dialog = shallowRef(false)
const isEditing = computed(() => !!formModel.value.id)

const headers = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Email', key: 'email' },
  { title: 'Password', key: 'password' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Department', key: 'dep', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end' }
]

onMounted(() => {
  reset()
})

function add() {
  formModel.value = createNewRecord()
  dialog.value = true
}

function edit(id) {
  const found = books.value.find(book => book.id === id)
  if (found) {
    formModel.value = { ...found }
    dialog.value = true
  }
}

function remove(id) {
  const index = books.value.findIndex(book => book.id === id)
  if (index !== -1) books.value.splice(index, 1)
}

function save() {
  if (isEditing.value) {
    const index = books.value.findIndex(book => book.id === formModel.value.id)
    if (index !== -1) books.value[index] = { ...formModel.value }
  } else {
    formModel.value.id = books.value.length + 1
    books.value.push({ ...formModel.value })
  }
  dialog.value = false
}

function reset() {
  dialog.value = false
  formModel.value = createNewRecord()
  books.value = [
    { id: 1, email: '123@gmail.com', password: '123456', status: 'single', dep: 'IT' },
    { id: 2, email: '122@gmail.com', password: '123456', status: 'good', dep: 'Engineering' },
    { id: 2, email: 'nutgztv@gmail.com', password: '123456', status: 'good', dep: 'IT ' }
  ]
}
</script>

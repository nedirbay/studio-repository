<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Printer } from '@element-plus/icons-vue'
import { openContractPrint, buildContractHtml, contractNumber, downloadContractPdf } from '../../../StudioOrderPage/studioContract'
import type { StudioOrder } from '../../../../types'

const props = defineProps<{
  modelValue: boolean
  order: StudioOrder | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function handlePrintContract(order: StudioOrder) {
  if (!openContractPrint(order)) {
    ElMessage.error('Açylýan penjirä (popup) rugsat ediň')
  }
}

const loadingDownload = ref(false)
async function handleDownloadContract(order: StudioOrder) {
  loadingDownload.value = true
  try {
    await downloadContractPdf(order)
  } catch (err) {
    console.error('PDF download failed', err)
    ElMessage.error('Şertnamany PDF formatda ýükläp bolmady')
  } finally {
    loadingDownload.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`Şertnama: ${order ? contractNumber(order) : ''}`"
    width="850px"
    class="studio-order-dialog"
    top="5vh"
    destroy-on-close
  >
    <div v-if="order" class="h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-gray-100 p-2 md:p-4 flex justify-center">
      <iframe
        :srcdoc="buildContractHtml(order)"
        class="w-full h-full border-none shadow-md bg-white rounded-lg"
      ></iframe>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="visible = false">Ýap</el-button>
        <el-button type="success" :icon="Document" :loading="loadingDownload" @click="handleDownloadContract(order!)">Ýükle (PDF)</el-button>
        <el-button type="primary" :icon="Printer" @click="handlePrintContract(order!)">Çap et</el-button>
      </div>
    </template>
  </el-dialog>
</template>

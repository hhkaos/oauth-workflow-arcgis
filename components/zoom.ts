import { ref } from 'vue'

// Step number whose raw HTTP is shown in the zoom overlay (null = closed)
export const zoomStep = ref<number | null>(null)

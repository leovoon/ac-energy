<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  seconds: number
}>();

const remainingSeconds = ref(props.seconds);
const timerId = ref<number | null>(null);

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const startTimer = () => {
  timerId.value = window.setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--;
    } else {
      if (timerId.value) {
        clearInterval(timerId.value);
      }
    }
  }, 1000);
};

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  if (timerId.value) {
    clearInterval(timerId.value);
  }
});
</script>

<template>
  <div class="flex items-center justify-center p-2 bg-muted rounded-md">
    <span class="text-lg font-semibold">{{ formatTime(remainingSeconds) }}</span>
  </div>
</template>
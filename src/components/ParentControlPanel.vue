<script setup lang="ts">
import { computed } from 'vue';
import { useDeviceStore } from '@/stores/deviceStore';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DeviceControlItem from "./DeviceControlItem.vue";

const deviceStore = useDeviceStore();
const userStore = useUserStore();

const showPanel = computed(() => userStore.isParent || userStore.isAdmin);
const devices = computed(() => deviceStore.devices);
</script>

<template>
  <div v-if="showPanel" class="mt-6">
    <Card class="w-full bg-card/50 border-primary/10">
      <CardHeader>
        <CardTitle>Parent Control Panel</CardTitle>
        <CardDescription>Manage and control all AC units in your home</CardDescription>
      </CardHeader>

      <CardContent>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Device Controls</h3>
            <Badge variant="outline">{{ devices.length }} Devices</Badge>
          </div>

          <Separator />

          <div v-if="devices.length > 0">
            <DeviceControlItem
              v-for="device in devices"
              :key="device.id"
              :device="device"
            />
          </div>

          <div v-else class="p-4 bg-muted rounded-md text-center">
            <p class="text-muted-foreground">No devices available</p>
          </div>
        </div>
      </CardContent>

     
    </Card>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from '@/composables/useToast';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Import RadioGroup directly from reka-ui for testing
import { RadioGroupRoot, RadioGroupItem as RekaRadioGroupItem, RadioGroupIndicator } from 'reka-ui';

const toast = useToast();
const notificationsEnabled = ref(true);
const autoShutdownEnabled = ref(true);
const parentModeEnabled = ref(true);
const temperatureUnit = ref('celsius');

// Watch for changes in temperature unit
const onTemperatureUnitChange = (value: string) => {
  console.log('Temperature unit changed to:', value);
  temperatureUnit.value = value;
};

const saveSettings = () => {
  // Log current settings
  console.log('Saving settings:', {
    temperatureUnit: temperatureUnit.value,
    notificationsEnabled: notificationsEnabled.value,
    autoShutdownEnabled: autoShutdownEnabled.value,
    parentModeEnabled: parentModeEnabled.value
  });

  // Save settings logic would go here
  toast.success('Settings saved successfully');
};
</script>

<template>
  <div>

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Usage Alerts</p>
              <p class="text-sm text-muted-foreground">Get notified when usage limits are approaching</p>
            </div>
            <Switch v-model:checked="notificationsEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Auto-Shutdown Alerts</p>
              <p class="text-sm text-muted-foreground">Get notified before auto-shutdown occurs</p>
            </div>
            <Switch v-model:checked="autoShutdownEnabled" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Manage user permissions and controls</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Parent Mode</p>
              <p class="text-sm text-muted-foreground">Enable parental controls for AC units</p>
            </div>
            <Switch v-model:checked="parentModeEnabled" />
          </div>

          <div>
            <p class="font-medium mb-2">Temperature Unit</p>
            <RadioGroupRoot
              :value="temperatureUnit"
              @update:value="onTemperatureUnitChange"
              class="flex flex-col space-y-2"
              name="temperature-unit"
            >
              <div class="flex items-center space-x-2">
                <RekaRadioGroupItem id="celsius" value="celsius" class="aspect-square size-4 rounded-full border">
                  <RadioGroupIndicator class="flex items-center justify-center">
                    <div class="size-2 rounded-full bg-primary"></div>
                  </RadioGroupIndicator>
                </RekaRadioGroupItem>
                <Label for="celsius">Celsius (°C)</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RekaRadioGroupItem id="fahrenheit" value="fahrenheit" class="aspect-square size-4 rounded-full border">
                  <RadioGroupIndicator class="flex items-center justify-center">
                    <div class="size-2 rounded-full bg-primary"></div>
                  </RadioGroupIndicator>
                </RekaRadioGroupItem>
                <Label for="fahrenheit">Fahrenheit (°F)</Label>
              </div>
            </RadioGroupRoot>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="mt-6 flex justify-end">
      <Button @click="saveSettings">Save Settings</Button>
    </div>
  </div>
</template>
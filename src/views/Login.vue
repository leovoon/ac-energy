<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { login } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
// SVG assets are imported as components automatically

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import DarkMode from '@/components/DarkMode.vue';

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();

// Form validation schema
const formSchema = toTypedSchema(z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
}));

// Form handling
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: '',
    password: '',
  },
});

const isLoading = ref(false);

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true;
  
  try {
    // Call the login function from api.ts
    const user = await login(values.username, values.password);
    
    // Update user store
    await userStore.fetchCurrentUser();
    
    // Show success message
    toast.success(`Welcome back, ${user.username}!`);
    
    // Redirect to dashboard
    router.push('/');
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Login failed. Please check your credentials.');
  } finally {
    isLoading.value = false;
  }
});

// Demo credentials
const fillDemoCredentials = (role: 'admin' | 'parent' | 'child') => {
  let username = '';
  let password = '';
  
  switch (role) {
    case 'admin':
      username = 'admin';
      password = 'admin123';
      break;
    case 'parent':
      username = 'parent';
      password = 'parent123';
      break;
    case 'child':
      username = 'child';
      password = 'child123';
      break;
  }
  
  form.setValues({
    username,
    password,
  });
};
</script>

<template>
  <div class="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted overflow-hidden">
    <div class="absolute inset-0 overflow-hidden opacity-30 dark:opacity-20">
        <img src="@/assets/ac-energy-bg.svg" alt="Background" class="w-full h-full object-cover text-primary" />
    </div>
    <div class="absolute top-4 right-4">
      <DarkMode />
    </div>
    <Card class="w-full max-w-md shadow-lg border-primary/10 bg-card/95 backdrop-blur-sm transform transition-all hover:scale-[1.01] z-10">
      <CardHeader class="text-center">
        <div class="flex justify-center w-fit m-auto rounded-full mb-2 dark:bg-primary/40 ">
          <img src="@/assets/ac-energy-logo.svg" alt="AC Energy Logo" class="h-16 w-16 text-primary " />
        </div>
        <CardTitle class="text-2xl font-bold text-primary">AC Energy Login</CardTitle>
        <CardDescription>Control your energy, save the planet</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="username">
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter your username" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <Button type="submit" class="w-full bg-primary hover:bg-primary/90 transition-all" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-2">
        <div class="text-sm text-muted-foreground mb-2 font-medium text-center">Quick Access Demo Accounts:</div>
        <div class="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" class="hover:bg-primary/20 hover:border-primary/30 transition-all" @click="fillDemoCredentials('admin')">Admin</Button>
          <Button variant="outline" size="sm" class="hover:bg-primary/20 hover:border-primary/30 transition-all" @click="fillDemoCredentials('parent')">Parent</Button>
          <Button variant="outline" size="sm" class="hover:bg-primary/20 hover:border-primary/30 transition-all" @click="fillDemoCredentials('child')">Child</Button>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

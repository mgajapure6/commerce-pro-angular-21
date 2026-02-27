// customer-form.ts
import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Customer {
  id?: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  type: 'new' | 'returning' | 'vip' | 'wholesale';
  status: 'active' | 'inactive' | 'blocked';
  addresses: {
    shipping: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    billing: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  tags: string[];
  notes: string;
  marketingConsent: boolean;
  orderNotifications: boolean;
  smsNotifications: boolean;
  taxExempt: boolean;
  taxExemptionNumber: string;
  preferredCurrency: string;
  preferredLanguage: string;
}

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss'
})
export class CustomerForm implements OnInit {
  // Form State
  customerForm = signal<Customer>({
    customerNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    type: 'new',
    status: 'active',
    addresses: {
      shipping: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA'
      },
      billing: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA'
      }
    },
    tags: [],
    notes: '',
    marketingConsent: true,
    orderNotifications: true,
    smsNotifications: false,
    taxExempt: false,
    taxExemptionNumber: '',
    preferredCurrency: 'USD',
    preferredLanguage: 'en'
  });

  // UI State
  currentStep = signal<'basic' | 'addresses' | 'preferences'>('basic');
  sameAsShipping = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  newTag = signal('');
  errors = signal<Record<string, string>>({});
  previewMode = signal(false);

  // Steps configuration
  steps = signal([
    { id: 'basic' as const, label: 'Basic Info' },
    { id: 'addresses' as const, label: 'Addresses' },
    { id: 'preferences' as const, label: 'Preferences' }
  ]);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.isEditMode.set(true);
      this.loadCustomer(customerId);
    } else {
      this.generateCustomerNumber();
    }
  }

  loadCustomer(id: string) {
    // Simulate loading customer data
    // In real app, this would be an API call
    this.customerForm.update(form => ({
      ...form,
      id: 'cust_001',
      customerNumber: 'C-2024-0001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      type: 'vip',
      status: 'active',
      addresses: {
        shipping: {
          line1: '123 Park Avenue',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        billing: {
          line1: '123 Park Avenue',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        }
      },
      tags: ['vip', 'newsletter', 'mobile-app'],
      notes: 'High-value customer, prioritize support',
      marketingConsent: true
    }));
  }

  generateCustomerNumber() {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.customerForm.update(form => ({
      ...form,
      customerNumber: `C-2024-${random}`
    }));
  }

  // Navigation
  goToStep(step: 'basic' | 'addresses' | 'preferences') {
    this.currentStep.set(step);
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      const steps = ['basic', 'addresses', 'preferences'];
      const currentIndex = steps.indexOf(this.currentStep());
      if (currentIndex < steps.length - 1) {
        this.currentStep.set(steps[currentIndex + 1] as any);
      }
    }
  }

  previousStep() {
    const steps = ['basic', 'addresses', 'preferences'];
    const currentIndex = steps.indexOf(this.currentStep());
    if (currentIndex > 0) {
      this.currentStep.set(steps[currentIndex - 1] as any);
    }
  }

  isStepCompleted(step: string): boolean {
    const steps = ['basic', 'addresses', 'preferences'];
    const currentIndex = steps.indexOf(this.currentStep());
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  }

  // Validation
  validateCurrentStep(): boolean {
    const errors: Record<string, string> = {};
    const form = this.customerForm();

    if (this.currentStep() === 'basic') {
      if (!form.firstName.trim()) {
        errors["firstName"] = 'First name is required';
      }
      if (!form.lastName.trim()) {
        errors["lastName"] = 'Last name is required';
      }
      if (!form.email.trim()) {
        errors["email"] = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors["email"] = 'Please enter a valid email';
      }
      if (!form.phone.trim()) {
        errors["phone"] = 'Phone number is required';
      }
    }

    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  // Tag Management
  addTag() {
    const tag = this.newTag().trim().toLowerCase();
    if (tag && !this.customerForm().tags.includes(tag)) {
      this.customerForm.update(form => ({
        ...form,
        tags: [...form.tags, tag]
      }));
      this.newTag.set('');
    }
  }

  removeTag(tag: string) {
    this.customerForm.update(form => ({
      ...form,
      tags: form.tags.filter(t => t !== tag)
    }));
  }

  // Address Management
  syncAddresses() {
    if (this.sameAsShipping()) {
      this.customerForm.update(form => ({
        ...form,
        addresses: {
          ...form.addresses,
          billing: { ...form.addresses.shipping }
        }
      }));
    }
  }

  // File Upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.customerForm.update(form => ({
          ...form,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.customerForm.update(form => ({
          ...form,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(event.dataTransfer.files[0]);
    }
  }

  removeAvatar() {
    this.customerForm.update(form => ({
      ...form,
      avatar: ''
    }));
  }

  // Actions
  saveCustomer() {
    if (!this.validateCurrentStep()) return;

    this.isSaving.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      console.log('Customer saved:', this.customerForm());
      this.router.navigate(['/customers']);
    }, 1500);
  }

  saveAsDraft() {
    console.log('Saving as draft:', this.customerForm());
    // Implement draft saving logic
  }

  togglePreview() {
    this.previewMode.update(v => !v);
  }

  // Helpers
  getFullName(): string {
    const form = this.customerForm();
    return `${form.firstName} ${form.lastName}`.trim();
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      new: 'bg-green-100 text-green-800',
      returning: 'bg-blue-100 text-blue-800',
      vip: 'bg-purple-100 text-purple-800',
      wholesale: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'text-green-600',
      inactive: 'text-gray-500',
      blocked: 'text-red-600'
    };
    return colors[status] || 'text-gray-500';
  }
}
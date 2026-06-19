'use client'
import { useAuthStore } from '@/store/authStore'
import RegisterModal from './RegisterModal'
import LoginModal from './LoginModal'
import ForgotPasswordModal from './ForgotPasswordModal'
import WelcomeBonus from './WelcomeBonus'
import { useEffect } from 'react'

export default function AuthModalManager() {
  var { isAuthModalOpen, authModalType, closeAuthModal, init } = useAuthStore();

  useEffect(function() { init(); }, []);

  return (
    <>
      {isAuthModalOpen && authModalType === 'register' && <RegisterModal />}
      {isAuthModalOpen && authModalType === 'login' && <LoginModal />}
      {isAuthModalOpen && authModalType === 'forgot' && <ForgotPasswordModal />}
      <WelcomeBonus />
    </>
  );
}

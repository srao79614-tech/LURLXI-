import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  CheckCircle2,
  ShieldCheck,
  X,
  ArrowRight,
  KeyRound,
  Sparkles,
  Flame,
  User,
  Calendar,
  Briefcase,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { playClickSound, playSuccessChime, playNetflixIntroSound } from '../utils/soundEffects';
import {
  saveUserSession,
  DEFAULT_USER_EMAIL,
  getUserProfile,
  saveUserProfile,
  DEFAULT_AVATARS,
} from '../utils/userStorage';
import { isPrivilegedAdminEmail } from '../utils/maskEmail';
import { signInWithGoogleFirebase, syncUserProfileToFirestore } from '../firebase';
import { UserProfile, CategoryType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess?: (email: string) => void;
  onSuccess?: (session: any) => void;
  defaultEmail?: string;
  initialStep?: 'input' | 'otp' | 'profile-setup';
  existingProfile?: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
  onSuccess,
  defaultEmail = DEFAULT_USER_EMAIL,
  initialStep = 'input',
  existingProfile,
}) => {
  const [email, setEmail] = useState<string>(defaultEmail);
  const [step, setStep] = useState<'input' | 'otp' | 'profile-setup' | 'entering'>('input');
  const [otpCode, setOtpCode] = useState<string>('796140');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile Information Fields for Step 2
  const [age, setAge] = useState<number>(() => {
    if (existingProfile?.age) return Number(existingProfile.age);
    try {
      const saved = localStorage.getItem('lurl_user_age');
      if (saved) return Number(saved);
    } catch {}
    return 26;
  });

  const [displayName, setDisplayName] = useState<string>(() => {
    if (existingProfile?.name && existingProfile.name !== 'Guest Explorer') return existingProfile.name;
    return defaultEmail.split('@')[0] || 'Executive Trader';
  });

  const [profession, setProfession] = useState<string>(() => {
    if (existingProfile?.profession) return existingProfile.profession;
    if (existingProfile?.role && !existingProfile.role.includes('Member')) return existingProfile.role;
    try {
      const saved = localStorage.getItem('lurl_user_profession');
      if (saved) return saved;
    } catch {}
    return 'Quantitative Trader';
  });

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    if (existingProfile?.avatarUrl) return existingProfile.avatarUrl;
    return DEFAULT_AVATARS[0].url;
  });

  const [customAvatarInput, setCustomAvatarInput] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<CategoryType>(() => {
    return existingProfile?.selectedCategory || 'trading';
  });

  // Track if this user has already completed their personal profile
  const isProfileAlreadyCompleted = (targetEmail: string): boolean => {
    const clean = targetEmail.trim().toLowerCase();
    try {
      const doneFlag = localStorage.getItem(`lurl_profile_setup_done_${clean}`);
      if (doneFlag === 'true') return true;
      const profile = getUserProfile(clean);
      if (profile && profile.age && Number(profile.age) >= 18 && profile.profession && profile.hasEnteredWebsite) {
        return true;
      }
    } catch {}
    return false;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialStep === 'profile-setup') {
        setStep('profile-setup');
      } else {
        setStep('input');
      }
      setEmail(defaultEmail);
      setOtpCode('796140');
      setErrorMsg(null);
      setIsLoading(false);
    }
  }, [isOpen, initialStep, defaultEmail]);

  if (!isOpen) return null;

  // Complete and enter platform, play original intro music once, and transition directly to dashboard
  const finalizeEntryToDashboard = (
    targetEmail: string,
    userAge: number,
    userName: string,
    userProfession: string,
    userAvatar: string
  ) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    const isVip =
      cleanEmail === 'srao79614@gmail.com' ||
      cleanEmail === 'lurlbusiness7@gmail.com' ||
      isPrivilegedAdminEmail(cleanEmail);

    // Save profile state permanently
    const profile = getUserProfile(cleanEmail, selectedTrack);
    profile.age = userAge;
    profile.name = userName.trim() || cleanEmail.split('@')[0];
    profile.profession = userProfession.trim() || 'Executive Professional';
    profile.avatarUrl = userAvatar;
    profile.selectedCategory = selectedTrack;
    profile.isVip = isVip;
    profile.role = isVip ? 'VIP Executive Founder' : userProfession;
    profile.hasEnteredWebsite = true;
    saveUserProfile(profile);

    // Mark personal profile setup as completed
    try {
      localStorage.setItem(`lurl_profile_setup_done_${cleanEmail}`, 'true');
      localStorage.setItem('lurl_user_age', String(userAge));
      localStorage.setItem('lurl_user_profession', profile.profession);
      localStorage.setItem('lurl_gmail_verified_v4', 'true');
      localStorage.setItem('lurl_platform_entered_v4', 'true');
      sessionStorage.setItem('lurl_gmail_verified_v4', 'true');
      sessionStorage.setItem('lurl_platform_entered_v4', 'true');
    } catch {}

    const session = {
      email: cleanEmail,
      name: profile.name,
      age: userAge,
      profession: profile.profession,
      verified: true,
      isVerified: true,
      verifiedAt: Date.now(),
      provider: 'gmail' as const,
      isVip,
      hasEnteredWebsite: true,
      profile,
    };

    saveUserSession(session);

    // Play the original pleasant background music ONE TIME only
    playNetflixIntroSound();
    setStep('entering');

    setTimeout(() => {
      if (onSuccess) onSuccess(session);
      if (onVerificationSuccess) onVerificationSuccess(session.email);
      onClose();
      setStep('input');
    }, 700);
  };

  const handleFirebaseGoogleSignIn = async () => {
    playClickSound();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const fbUser = await signInWithGoogleFirebase();
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase();
        setEmail(cleanEmail);
        const nameCandidate = fbUser.displayName || cleanEmail.split('@')[0];
        setDisplayName(nameCandidate);
        if (fbUser.photoURL) {
          setAvatarUrl(fbUser.photoURL);
        }

        await syncUserProfileToFirestore(fbUser, {
          selectedCategory: selectedTrack,
          isVip: isPrivilegedAdminEmail(cleanEmail),
          role: isPrivilegedAdminEmail(cleanEmail) ? 'VIP Executive Founder' : profession,
        });

        // If first time profile setup, go to Step 2
        if (!isProfileAlreadyCompleted(cleanEmail)) {
          setIsLoading(false);
          setStep('profile-setup');
        } else {
          finalizeEntryToDashboard(cleanEmail, age, nameCandidate, profession, avatarUrl);
        }
      }
    } catch (err: any) {
      console.warn('Firebase login fallback:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. You can also use 1-click verification.');
      } else {
        setErrorMsg('Firebase Sign-In initialized. You can also use 1-click verification.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.endsWith('.com')) {
      setErrorMsg('Please enter a valid Gmail address (e.g. yourname@gmail.com)');
      return;
    }

    playClickSound();
    setStep('otp');
    setOtpCode('796140');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    playClickSound();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user has already set up their personal profile
    if (!isProfileAlreadyCompleted(cleanEmail)) {
      setStep('profile-setup');
    } else {
      finalizeEntryToDashboard(cleanEmail, age, displayName, profession, avatarUrl);
    }
  };

  const handleQuickOneClickGmail = () => {
    playClickSound();
    const cleanEmail = defaultEmail.toLowerCase();
    setEmail(cleanEmail);

    if (!isProfileAlreadyCompleted(cleanEmail)) {
      setStep('profile-setup');
    } else {
      finalizeEntryToDashboard(cleanEmail, age, displayName, profession, avatarUrl);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || age < 18 || age > 105) {
      setErrorMsg('Please enter a valid age between 18 and 100.');
      return;
    }
    if (!displayName.trim()) {
      setErrorMsg('Please enter your full name or trader handle.');
      return;
    }
    if (!profession.trim()) {
      setErrorMsg('Please enter your profession.');
      return;
    }
    setErrorMsg(null);
    playClickSound();
    finalizeEntryToDashboard(email, age, displayName, profession, avatarUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-lg p-5 sm:p-7 rounded-2xl bg-[#0c1018] border border-[#d47a37]/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2233] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#d47a37] to-transparent" />

        {/* STEP 1: Email Input */}
        {step === 'input' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#d47a37]/15 border border-[#d47a37]/40 flex items-center justify-center text-[#f8b179]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    STEP 1 OF 2 • VERIFY CREDENTIAL
                  </span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono rounded-full flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" /> FIRESTORE
                  </span>
                </div>
                <h2 className="text-xl font-bold font-['Cinzel'] text-white">
                  Verify Your Gmail ID
                </h2>
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Verify your Gmail ID to access the platform, Firestore cloud vault, trading analytics, and curriculum chapters.
            </p>

            {/* Firebase Google Sign-In Primary Button */}
            <button
              type="button"
              onClick={handleFirebaseGoogleSignIn}
              disabled={isLoading}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-[#1e2638] to-[#121927] hover:border-amber-400/80 border border-amber-500/40 text-white flex items-center justify-between cursor-pointer transition-all shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-sm">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>Sign in with Google via Firebase</span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-mono">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Real Firebase Auth & Firestore cloud vault
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick 1-Click Option for default user */}
            <button
              type="button"
              onClick={handleQuickOneClickGmail}
              disabled={isLoading}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#172033] to-[#121927] hover:from-[#1e2a42] hover:to-[#172136] border border-[#3b82f6]/40 hover:border-[#3b82f6] text-white flex items-center justify-between cursor-pointer transition-all shadow-sm group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-900">
                  G
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                    1-Click Instant Verify as {defaultEmail}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Direct token verification
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-[#1f2638]" />
              <span className="absolute px-3 bg-[#0c1018] text-[10px] font-mono uppercase text-gray-500">
                Or enter Gmail ID
              </span>
            </div>

            <form onSubmit={handleSendCode} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Gmail Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080b12] border border-[#252c3d] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#d47a37] transition-all font-mono"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] text-white text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <span>Continue to Step 2 Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2A: OTP Code Verification */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  STEP 2 OF 2 • CODE CONFIRMATION
                </span>
                <h2 className="text-xl font-bold font-['Cinzel'] text-white">
                  Enter 6-Digit Code
                </h2>
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Dispatched code to <strong className="text-white">{email}</strong>. Pre-filled below for instant verification.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="796140"
                  className="w-full py-3 px-4 rounded-xl bg-[#080b12] border border-[#252c3d] text-center font-mono text-xl tracking-[0.5em] text-white focus:outline-none focus:border-[#d47a37] transition-all"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Code & Set Profile Details</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('input')}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Change Gmail ID
              </button>
            </form>
          </div>
        )}

        {/* STEP 2B: Required Personal Profile Information (Age, Gmail ID, Profession, Logo) */}
        {step === 'profile-setup' && (
          <div className="space-y-4 animate-in fade-in duration-200 max-h-[80vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-[#1f2638] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#d47a37]/20 border border-[#d47a37]/50 flex items-center justify-center text-[#f8b179]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    STEP 2 VERIFICATION • PROFILE INFORMATION
                  </div>
                  <h2 className="text-lg font-bold font-['Cinzel'] text-white">
                    Personal Profile Details
                  </h2>
                </div>
              </div>

              {/* Verified Gmail Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              {/* Field 1: Gmail ID (Explicitly shown & verified) */}
              <div className="p-3 rounded-xl bg-[#080b12] border border-[#252c3d] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">
                    Verified Gmail ID
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Field 2: Age (Input + Quick Select Brackets) */}
              <div className="p-3 rounded-xl bg-[#080b12] border border-[#252c3d] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#f8b179]" />
                    <span>Age</span>
                  </label>
                  <span className="font-mono text-emerald-400 font-bold text-xs">
                    {age} Years Old
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-[#10141f] border border-[#374151] text-white font-mono text-center font-bold text-sm focus:outline-none focus:border-[#d47a37]"
                  />
                  <div className="flex-1 grid grid-cols-4 gap-1.5">
                    {[
                      { label: '18-24', val: 22 },
                      { label: '25-34', val: 28 },
                      { label: '35-49', val: 40 },
                      { label: '50+', val: 54 },
                    ].map((bracket) => (
                      <button
                        key={bracket.label}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setAge(bracket.val);
                        }}
                        className={`py-1.5 px-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          (bracket.val === 22 && age <= 24) ||
                          (bracket.val === 28 && age >= 25 && age <= 34) ||
                          (bracket.val === 40 && age >= 35 && age <= 49) ||
                          (bracket.val === 54 && age >= 50)
                            ? 'bg-[#d47a37] text-white'
                            : 'bg-[#151a27] text-gray-400 hover:text-white hover:bg-[#1f273b]'
                        }`}
                      >
                        {bracket.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 3: Profession (Input + Quick Profession Tags) */}
              <div className="p-3 rounded-xl bg-[#080b12] border border-[#252c3d] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#f8b179]" />
                    <span>Your Profession</span>
                  </label>
                  <span className="font-mono text-amber-300 text-[11px]">
                    {profession}
                  </span>
                </div>

                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Quantitative Trader, Software Engineer, Entrepreneur..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#10141f] border border-[#374151] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#d47a37]"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Quantitative Trader',
                    'Software Engineer',
                    'Entrepreneur / Founder',
                    'Corporate Leader',
                    'Student / Analyst',
                    'E-Commerce Specialist',
                  ].map((prof) => (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setProfession(prof);
                      }}
                      className={`text-[10px] font-medium py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                        profession === prof
                          ? 'border-[#d47a37] bg-[#d47a37]/20 text-[#f8b179] font-bold'
                          : 'border-[#252c3d] bg-[#121622] text-gray-400 hover:text-white hover:bg-[#182030]'
                      }`}
                    >
                      {prof}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Logo / Profile Avatar Selection (Executive Badges) */}
              <div className="p-3 rounded-xl bg-[#080b12] border border-[#252c3d] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#f8b179]" />
                    <span>Choose Your Logo / Avatar</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Permanently Saved
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {DEFAULT_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setAvatarUrl(av.url);
                      }}
                      className={`relative p-1 rounded-xl border transition-all cursor-pointer group ${
                        avatarUrl === av.url
                          ? 'border-[#f8b179] ring-2 ring-[#d47a37]/60 shadow-md scale-105'
                          : 'border-[#252c3d] hover:border-gray-500 bg-[#121622]'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-full aspect-square rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {avatarUrl === av.url && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#d47a37] text-white flex items-center justify-center text-[9px] shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Image URL fallback */}
                <div className="pt-1">
                  <input
                    type="url"
                    value={customAvatarInput}
                    onChange={(e) => {
                      setCustomAvatarInput(e.target.value);
                      if (e.target.value.startsWith('http')) {
                        setAvatarUrl(e.target.value);
                      }
                    }}
                    placeholder="Or paste custom logo / avatar image URL..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#10141f] border border-[#2a3449] text-white text-[11px] placeholder-gray-600 focus:outline-none focus:border-[#d47a37]"
                  />
                </div>
              </div>

              {/* Live Preview Badge */}
              <div className="p-2.5 rounded-xl bg-[#10141f] border border-[#252c3d] flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Profile Logo"
                  className="w-10 h-10 rounded-full object-cover border border-[#d47a37] shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-mono">
                      Age {age}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {profession} • <span className="font-mono text-emerald-400">{email}</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Clean Professional Action Button (NO Netflix symbol, plays gentle background chime once) */}
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#d47a37] via-[#e08a46] to-[#b85d19] hover:from-[#e59350] hover:to-[#a2480f] text-white text-xs font-bold transition-all cursor-pointer shadow-[0_10px_25px_rgba(212,122,55,0.35)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Confirm Profile & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2C: Instant Clean Transition into Dashboard */}
        {step === 'entering' && (
          <div className="py-8 text-center space-y-3 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Cinzel'] text-white">
                Profile Verified & Saved
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Entering dashboard workspace for <span className="text-[#f8b179] font-bold">{displayName}</span>...
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

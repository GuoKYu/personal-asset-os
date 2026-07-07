import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  User,
  Heart,
  Calendar,
  Phone,
  Users,
} from 'lucide-react'
import { healthService } from '@/services/healthService'
import type { FamilyMember } from '@/types'
import ParticleBackground from '@/components/effects/ParticleBackground'

const FamilyMemberPage: React.FC = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await healthService.getFamilyMembers()
        setMembers(data)
      } catch (error) {
        console.error('Failed to load family members:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMembers()
  }, [])

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '--'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 anim-fade-in-down"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(99,102,241,0.08))',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <ParticleBackground count={30} />
        <div className="relative px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--pao-text-primary)' }}>
                家庭成员
                <span className="gradient-text ml-2">Family</span>
              </h1>
              <p style={{ color: 'var(--pao-text-secondary)' }}>{members.length} 位家庭成员</p>
            </div>
            <button
              onClick={() => navigate('/health/members/add')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #ef4444, #6366f1)' }}
            >
              <Plus className="h-4 w-4" />
              添加成员
            </button>
          </div>
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="glass-card p-5 anim-fade-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--pao-bg-hover)' }}
              >
                <User className="h-6 w-6" style={{ color: 'var(--pao-text-primary)' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--pao-text-primary)' }}>
                  {member.name}
                </h3>
                <p className="text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
                  {member.relationship} · {calculateAge(member.birthDate)} 岁
                  {member.gender && ` · ${member.gender === 'male' ? '男' : '女'}`}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs" style={{ color: 'var(--pao-text-secondary)' }}>
              {member.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>出生: {member.birthDate}</span>
                </div>
              )}
              {member.occupation && (
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  <span>职业: {member.occupation}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>

            {member.emergencyContact && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--pao-border)' }}>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full text-red-600 bg-red-500/10">
                  <Heart className="h-3 w-3" />
                  紧急联系人
                </span>
              </div>
            )}

            <button
              onClick={() => navigate(`/health/records?member=${member.id}`)}
              className="mt-3 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
            >
              <Heart className="h-3 w-3" />
              查看健康记录
            </button>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-20">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--pao-text-secondary)' }}>暂无家庭成员数据</p>
        </div>
      )}
    </div>
  )
}

export default FamilyMemberPage

import React from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  User,
  Heart,
  AlertCircle,
  Calendar,
  Ruler,
  Weight,
  Droplet,
  Stethoscope,
} from 'lucide-react'
import { mockFamilyMembers } from '@/db/mock-data'
import { Breadcrumb } from '@/components/ui'

const FamilyMemberPage: React.FC = () => {
  const genderIcon = (gender: string) => {
    return gender === 'male'
      ? <User className="h-5 w-5 text-blue-500" />
      : <User className="h-5 w-5 text-pink-500" />
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6" aria-label="家庭成员">
      <Breadcrumb items={[
        { label: '健康管理', href: '/health' },
        { label: '家庭成员' },
      ]} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">家庭成员</h1>
          <p className="text-sm text-gray-500 mt-1">{mockFamilyMembers.length} 位成员</p>
        </div>
        <Link
          to="/health/members/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          aria-label="添加家庭成员"
        >
          <Plus className="h-4 w-4" />
          添加成员
        </Link>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockFamilyMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            aria-label={`${member.name} 健康信息`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                {genderIcon(member.gender)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{member.name}</h3>
                <p className="text-xs text-gray-500">
                  {member.relation} · {calculateAge(member.birthDate)} 岁 · {member.gender === 'male' ? '男' : '女'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600">出生: {member.birthDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplet className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-600">血型: {member.bloodType}型</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-600">{member.height}cm</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-600">{member.weight}kg</span>
                </span>
              </div>
            </div>

            {/* Allergies */}
            {member.allergies.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-orange-600 mb-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>过敏史</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.allergies.map((a) => (
                    <span key={a} className="px-2 py-0.5 text-xs rounded bg-orange-50 text-orange-700">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chronic Conditions */}
            {member.chronicConditions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-red-600 mb-1">
                  <Stethoscope className="h-3 w-3" />
                  <span>慢性病</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.chronicConditions.map((c) => (
                    <span key={c} className="px-2 py-0.5 text-xs rounded bg-red-50 text-red-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              to={`/health/records?member=${member.id}`}
              className="mt-4 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Heart className="h-3 w-3" />
              查看健康记录
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FamilyMemberPage

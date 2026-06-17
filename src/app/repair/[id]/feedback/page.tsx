'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function RepairFeedbackPage() {
  const { id } = useParams();
  const [repair, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [ratings, setRatings] = useState({
    rating_speed: 0,
    rating_quality: 0,
    rating_service: 0,
    rating_overall: 0
  });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetch(`/api/repair/${id}/feedback`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setRepair(data);
          if (data.rating_overall) {
            setSubmitted(true);
          }
        }
        setLoading(false);
      });
  }, [id]);

  const handleStarClick = (category: string, value: number) => {
    if (submitted) return;
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratings.rating_speed === 0 || ratings.rating_quality === 0 || ratings.rating_service === 0 || ratings.rating_overall === 0) {
      alert('กรุณาให้คะแนนให้ครบทุกหัวข้อครับ');
      return;
    }
    
    setSubmitting(true);
    const res = await fetch(`/api/repair/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ratings, feedback })
    });
    
    if (res.ok) {
      setSubmitted(true);
    } else {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
    setSubmitting(false);
  };

  const StarRating = ({ category, label }: { category: string, label: string }) => {
    const currentValue = ratings[category as keyof typeof ratings];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(category, star)}
              disabled={submitted}
              className={`p-1 transition-colors ${
                star <= currentValue ? 'text-yellow-400' : 'text-gray-300'
              } ${!submitted && 'hover:text-yellow-500'}`}
            >
              <Star size={32} fill={star <= currentValue ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>กำลังโหลดข้อมูล...</p></div>;
  if (!repair) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>ไม่พบข้อมูลการแจ้งซ่อม</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1e3a8a] p-6 text-white text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Logo" width={50} height={50} className="bg-white rounded-full p-1" />
          </div>
          <h1 className="text-xl font-bold mb-1">แบบประเมินความพึงพอใจ</h1>
          <p className="text-blue-200 text-sm">การให้บริการซ่อมบำรุง SMKCC AssetX</p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">ขอบคุณสำหรับคำประเมิน</h2>
            <p className="text-gray-600 text-sm">เราจะนำข้อเสนอแนะของคุณไปพัฒนาการให้บริการให้ดียิ่งขึ้นครับ</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-bold text-blue-900 mb-2">ข้อมูลอ้างอิงงานซ่อม</h3>
              <p className="text-xs text-gray-700"><strong>รหัสครุภัณฑ์:</strong> {repair.asset_code}</p>
              <p className="text-xs text-gray-700"><strong>รายการ:</strong> {repair.category} {repair.brand} {repair.model}</p>
              <p className="text-xs text-gray-700"><strong>อาการ:</strong> {repair.issue_description}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <StarRating category="rating_speed" label="1. ความรวดเร็วในการให้บริการ" />
              <StarRating category="rating_quality" label="2. คุณภาพและประสิทธิภาพในการซ่อม" />
              <StarRating category="rating_service" label="3. การสื่อสารและมารยาทของเจ้าหน้าที่" />
              <div className="border-t border-gray-200 my-4 pt-4">
                <StarRating category="rating_overall" label="4. ความพึงพอใจในภาพรวม" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ข้อเสนอแนะเพิ่มเติม (ถ้ามี)</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="พิมพ์ข้อเสนอแนะของคุณที่นี่..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1e3a8a] text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition disabled:bg-blue-300"
              >
                {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งแบบประเมิน'}
              </button>
            </form>
          </div>
        )}
      </div>
      
      <footer className="mt-8 text-center text-xs text-gray-400">
        พัฒนาระบบโดย งานเทคโนโลยีสารสนเทศ วิทยาลัยชุมชนสมุทรสาคร
      </footer>
    </div>
  );
}

# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    sequence(:username) { |n| "user#{n}" }
    password { 'password123' }
    # password_confirmation は password と一致させる（has_secure_password のバリデーション対応）
    password_confirmation { password }
  end
end

# spec/factories/posts.rb
FactoryBot.define do
  factory :post do
    association :user
    sequence(:body) { |n| "旅行記録#{n}: 素晴らしい旅でした。" }
  end
end

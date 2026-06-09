require 'rails_helper'
require 'rswag/specs'

RSpec.configure do |config|
  # swagger.yaml の出力先（swagger/ ディレクトリ）
  config.openapi_root = Rails.root.join('swagger').to_s

  # OpenAPI 3.0 定義
  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'TripShare API',
        version: 'v1',
        description: '旅行記録SNSアプリ TripShare のAPI仕様書'
      },
      paths: {},
      servers: [
        {
          url: 'http://{defaultHost}',
          variables: {
            defaultHost: {
              default: 'localhost:3001'
            }
          }
        }
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: :apiKey,
            in: :cookie,
            name: 'session_token'
          }
        },
        schemas: {
          User: {
            type: :object,
            properties: {
              id: { type: :integer },
              email: { type: :string, format: :email },
              username: { type: :string },
              avatar_key: { type: :string, nullable: true },
              following_count: { type: :integer },
              followers_count: { type: :integer },
              created_at: { type: :string, format: :'date-time' }
            },
            required: %w[id email username following_count followers_count created_at]
          },
          PostUser: {
            type: :object,
            description: '投稿に含まれる投稿者の情報（軽量版）',
            properties: {
              id: { type: :integer },
              username: { type: :string },
              avatar_key: { type: :string, nullable: true }
            },
            required: %w[id username]
          },
          Post: {
            type: :object,
            properties: {
              id: { type: :integer },
              body: { type: :string },
              user: { '$ref' => '#/components/schemas/PostUser' },
              comments_count: { type: :integer },
              likes_count: { type: :integer },
              liked_by_current_user: { type: :boolean },
              created_at: { type: :string, format: :'date-time' }
            },
            required: %w[id body user comments_count likes_count created_at]
          },
          Comment: {
            type: :object,
            properties: {
              id: { type: :integer },
              body: { type: :string },
              user: { '$ref' => '#/components/schemas/User' },
              created_at: { type: :string, format: :'date-time' }
            },
            required: %w[id body user created_at]
          },
          ApiError: {
            type: :object,
            properties: {
              error: { type: :string }
            },
            required: %w[error]
          },
          ValidationError: {
            type: :object,
            properties: {
              errors: {
                type: :array,
                items: {
                  type: :object,
                  properties: {
                    field: { type: :string },
                    message: { type: :string }
                  },
                  required: %w[field message]
                }
              }
            },
            required: %w[errors]
          }
        }
      }
    }
  }

  # 出力フォーマットをYAMLに設定
  config.openapi_format = :yaml
end

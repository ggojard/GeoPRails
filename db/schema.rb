# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160417211053) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_admin_comments", force: :cascade do |t|
    t.string   "namespace",     limit: 255
    t.text     "body"
    t.string   "resource_id",   limit: 255, null: false
    t.string   "resource_type", limit: 255, null: false
    t.integer  "author_id"
    t.string   "author_type",   limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], name: "index_active_admin_comments_on_author_type_and_author_id", using: :btree
  add_index "active_admin_comments", ["namespace"], name: "index_active_admin_comments_on_namespace", using: :btree
  add_index "active_admin_comments", ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource_type_and_resource_id", using: :btree

  create_table "admin_user_role_to_buildings", force: :cascade do |t|
    t.integer  "admin_user_role_id"
    t.integer  "building_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "admin_user_roles", force: :cascade do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",       limit: 255
  end

  create_table "admin_user_types", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "code",       limit: 255
  end

  create_table "admin_users", force: :cascade do |t|
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                      default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "company_id"
    t.string   "username",               limit: 255
    t.integer  "admin_user_type_id"
    t.integer  "admin_user_role_id"
  end

  add_index "admin_users", ["email"], name: "index_admin_users_on_email", unique: true, using: :btree
  add_index "admin_users", ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true, using: :btree

  create_table "affectations", force: :cascade do |t|
    t.integer  "person_id"
    t.integer  "room_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "workplace_name"
  end

  create_table "buildings", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.integer  "company_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color",      limit: 255
  end

  add_index "buildings", ["company_id"], name: "index_buildings_on_company_id", using: :btree

  create_table "companies", force: :cascade do |t|
    t.string   "name",           limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "analytics_code", limit: 255
    t.string   "logo",           limit: 255
  end

  create_table "evacuation_zones", force: :cascade do |t|
    t.string   "color",      limit: 255
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "floors", force: :cascade do |t|
    t.string   "name",               limit: 255
    t.integer  "building_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_file_name",    limit: 255
    t.string   "image_content_type", limit: 255
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.integer  "map_scale_x1"
    t.integer  "map_scale_y1"
    t.integer  "map_scale_x2"
    t.integer  "map_scale_y2"
    t.float    "map_scale_length"
    t.string   "image_dimensions",   limit: 255
    t.integer  "level"
    t.float    "background_opacity",             default: 0.25
  end

  add_index "floors", ["building_id"], name: "index_floors_on_building_id", using: :btree

  create_table "floors_images", force: :cascade do |t|
    t.string   "style",         limit: 255
    t.integer  "floor_id"
    t.binary   "file_contents"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "homes", force: :cascade do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "inventories", force: :cascade do |t|
    t.integer  "room_id"
    t.integer  "item_type_id"
    t.integer  "quantity"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "item_qualities", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.integer  "rank"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "item_type_brands", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "item_types", force: :cascade do |t|
    t.string   "name",               limit: 255
    t.string   "code",               limit: 255
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "price"
    t.integer  "item_type_brand_id"
    t.string   "color"
  end

  create_table "items", force: :cascade do |t|
    t.integer  "x"
    t.integer  "y"
    t.integer  "room_id"
    t.integer  "item_quality_id"
    t.datetime "purchase_date"
    t.string   "immo_code",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "item_type_id"
  end

  add_index "items", ["item_quality_id"], name: "index_items_on_item_quality_id", using: :btree
  add_index "items", ["item_type_id"], name: "index_items_on_item_type_id", using: :btree
  add_index "items", ["room_id"], name: "index_items_on_room_id", using: :btree

  create_table "organization_types", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "organizations", force: :cascade do |t|
    t.string   "name",                 limit: 255
    t.integer  "organization_type_id"
    t.integer  "organization_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "company_id"
    t.string   "color",                limit: 255
  end

  add_index "organizations", ["organization_id"], name: "index_organizations_on_organization_id", using: :btree
  add_index "organizations", ["organization_type_id"], name: "index_organizations_on_organization_type_id", using: :btree

  create_table "people", force: :cascade do |t|
    t.string   "firstname",         limit: 255
    t.string   "lastname",          limit: 255
    t.string   "monitorreference",  limit: 255
    t.string   "computerreference", limit: 255
    t.string   "telephone",         limit: 255
    t.string   "cellphone",         limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "person_state_id"
    t.integer  "organization_id"
    t.string   "email",             limit: 255
    t.string   "person_code",       limit: 255
    t.string   "badge_number",      limit: 255
    t.string   "photo",             limit: 255
    t.string   "title",             limit: 255
  end

  create_table "person_states", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "room_ground_types", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color",      limit: 255
  end

  create_table "room_types", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color",      limit: 255
  end

  create_table "rooms", force: :cascade do |t|
    t.string   "name",                limit: 255
    t.integer  "room_type_id"
    t.integer  "floor_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "points"
    t.integer  "organization_id"
    t.integer  "room_ground_type_id"
    t.float    "area"
    t.integer  "evacuation_zone_id"
    t.text     "network"
    t.float    "perimeter"
    t.string   "anchor_text_point",   limit: 255
    t.integer  "free_desk_number"
    t.integer  "capacity"
  end

  add_index "rooms", ["floor_id"], name: "index_rooms_on_floor_id", using: :btree
  add_index "rooms", ["room_type_id"], name: "index_rooms_on_room_type_id", using: :btree

  create_table "workplace_affectations", force: :cascade do |t|
    t.integer  "person_id"
    t.integer  "workplace_id"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  add_index "workplace_affectations", ["person_id"], name: "index_workplace_affectations_on_person_id", using: :btree
  add_index "workplace_affectations", ["workplace_id"], name: "index_workplace_affectations_on_workplace_id", using: :btree

  create_table "workplaces", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "room_id"
  end

  add_foreign_key "items", "item_types"
  add_foreign_key "workplace_affectations", "people"
  add_foreign_key "workplace_affectations", "workplaces"
end

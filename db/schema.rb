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

ActiveRecord::Schema.define(version: 20140731180639) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_admin_comments", force: true do |t|
    t.string   "namespace"
    t.text     "body"
    t.string   "resource_id",   null: false
    t.string   "resource_type", null: false
    t.integer  "author_id"
    t.string   "author_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], name: "index_active_admin_comments_on_author_type_and_author_id", using: :btree
  add_index "active_admin_comments", ["namespace"], name: "index_active_admin_comments_on_namespace", using: :btree
  add_index "active_admin_comments", ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource_type_and_resource_id", using: :btree

  create_table "admin_users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "company_id"
    t.string   "username"
  end

  add_index "admin_users", ["email"], name: "index_admin_users_on_email", unique: true, using: :btree
  add_index "admin_users", ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true, using: :btree

  create_table "affectations", force: true do |t|
    t.integer  "person_id"
    t.integer  "room_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "buildings", force: true do |t|
    t.string   "name"
    t.integer  "company_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "buildings", ["company_id"], name: "index_buildings_on_company_id", using: :btree

  create_table "companies", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "evacuation_zones", force: true do |t|
    t.string   "color"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "floors", force: true do |t|
    t.string   "name"
    t.integer  "building_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.integer  "map_scale_x1"
    t.integer  "map_scale_y1"
    t.integer  "map_scale_x2"
    t.integer  "map_scale_y2"
    t.float    "map_scale_length"
    t.string   "image_dimensions"
  end

  add_index "floors", ["building_id"], name: "index_floors_on_building_id", using: :btree

  create_table "floors_images", force: true do |t|
    t.string   "style"
    t.integer  "floor_id"
    t.binary   "file_contents"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "homes", force: true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "inventories", force: true do |t|
    t.integer  "room_id"
    t.integer  "item_id"
    t.integer  "quantity"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "items", force: true do |t|
    t.string   "name"
    t.string   "code"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "organization_types", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "organizations", force: true do |t|
    t.string   "name"
    t.integer  "organization_type_id"
    t.integer  "organization_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "company_id"
    t.string   "color"
  end

  add_index "organizations", ["organization_id"], name: "index_organizations_on_organization_id", using: :btree
  add_index "organizations", ["organization_type_id"], name: "index_organizations_on_organization_type_id", using: :btree

  create_table "people", force: true do |t|
    t.string   "firstname"
    t.string   "lastname"
    t.string   "monitorreference"
    t.string   "computerreference"
    t.string   "telephone"
    t.string   "cellphone"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "person_state_id"
    t.integer  "organization_id"
  end

  create_table "person_states", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "room_ground_types", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color"
  end

  create_table "room_types", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color"
  end

  create_table "rooms", force: true do |t|
    t.string   "name"
    t.integer  "room_type_id"
    t.integer  "floor_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "points"
    t.integer  "organization_id"
    t.integer  "room_ground_type_id"
    t.float    "area"
    t.integer  "evacuation_zone_id"
  end

  add_index "rooms", ["floor_id"], name: "index_rooms_on_floor_id", using: :btree
  add_index "rooms", ["room_type_id"], name: "index_rooms_on_room_type_id", using: :btree

  create_table "roots", force: true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end

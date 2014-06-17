class AddAttachmentImageToFloor < ActiveRecord::Migration
  def change
    add_attachment :floors, :image
  end
end

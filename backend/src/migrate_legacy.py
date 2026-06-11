"""
数据迁移脚本：将旧版 history.json 中的 __legacy__ 数据迁移到新版档案目录
- 旧位置：backend/src/data/history.json
- 新位置：backend/src/data/users/<profile_id>/history.json
- uploads 目录中对应的 PDF 文件也会一并迁移

执行：python backend/src/migrate_legacy.py
"""
import os
import json
import shutil
import re
import sys

# 旧版存储
OLD_HISTORY = "data/history.json"
OLD_UPLOADS = "uploads"

# 新版存储
NEW_BASE = "data/users"
SAFE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_]{1,64}$")


def safe_profile_id(name: str) -> str:
    """根据档案名生成 profileId（与前端 userProfile.ts 保持一致的算法）"""
    import hashlib
    h = hashlib.md5(name.strip().lower().encode("utf-8")).hexdigest()[:16]
    return f"prof_default_{h}"


def migrate_legacy_data(profile_name: str = "我的简历"):
    """迁移 __legacy__ 数据到指定档案"""
    if not os.path.exists(OLD_HISTORY):
        print("[跳过] 旧版 history.json 不存在，无需迁移")
        return False

    profile_id = safe_profile_id(profile_name)
    new_profile_dir = os.path.join(NEW_BASE, profile_id)
    new_uploads = os.path.join(new_profile_dir, "uploads")
    new_history = os.path.join(new_profile_dir, "history.json")

    # 加载旧数据
    with open(OLD_HISTORY, "r", encoding="utf-8") as f:
        old_data = json.load(f)

    legacy = old_data.get("__legacy__", {})
    if not legacy:
        print("[跳过] 旧数据中无 __legacy__ 内容")
        return False

    # 创建新目录
    os.makedirs(new_uploads, exist_ok=True)
    print(f"[创建] 档案目录: {new_profile_dir}")

    # 迁移 PDF
    moved_files = 0
    if os.path.exists(OLD_UPLOADS):
        for resume_id, resume in legacy.items():
            old_pdf = os.path.join(OLD_UPLOADS, f"{resume_id}.pdf")
            if os.path.exists(old_pdf):
                new_pdf = os.path.join(new_uploads, f"{resume_id}.pdf")
                shutil.move(old_pdf, new_pdf)
                moved_files += 1
    print(f"[迁移] 移动 {moved_files} 个 PDF 文件")

    # 写入新 history.json
    with open(new_history, "w", encoding="utf-8") as f:
        json.dump(legacy, f, ensure_ascii=False, indent=2)
    print(f"[写入] 新版 history.json: {new_history} ({len(legacy)} 条记录)")

    # 从旧 history.json 中移除 __legacy__
    del old_data["__legacy__"]
    if not old_data:
        # 完全空了就删除旧文件
        os.remove(OLD_HISTORY)
        print(f"[清理] 删除空的旧文件: {OLD_HISTORY}")
    else:
        with open(OLD_HISTORY, "w", encoding="utf-8") as f:
            json.dump(old_data, f, ensure_ascii=False, indent=2)
        print(f"[更新] 清理旧文件中的 __legacy__ 字段")

    print(f"\n[完成] 数据已迁移到档案「{profile_name}」(profileId: {profile_id})")
    print(f"       启动后端服务后，浏览器刷新页面即可看到历史记录")
    return True


if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "我的简历"
    print(f"=== 旧数据迁移工具 ===")
    print(f"目标档案名: {name}")
    print()
    migrate_legacy_data(name)

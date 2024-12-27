PGDMP                         |            postgres     15.10 (Debian 15.10-1.pgdg120+1)    15.3 K    t           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            u           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            v           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            w           1262    5    postgres    DATABASE     s   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE postgres;
                admin    false            x           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   admin    false    3447                        2615    16389    thesis-management    SCHEMA     #   CREATE SCHEMA "thesis-management";
 !   DROP SCHEMA "thesis-management";
                admin    false            S           1247    16391 	   user_role    TYPE     j   CREATE TYPE "thesis-management".user_role AS ENUM (
    'student',
    'instructor',
    'secretariat'
);
 )   DROP TYPE "thesis-management".user_role;
       thesis-management          admin    false    6            �            1259    16488    announcements    TABLE       CREATE TABLE "thesis-management".announcements (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    presentation_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 .   DROP TABLE "thesis-management".announcements;
       thesis-management         heap    admin    false    6            �            1259    16487    announcements_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE "thesis-management".announcements_id_seq;
       thesis-management          admin    false    226    6            y           0    0    announcements_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE "thesis-management".announcements_id_seq OWNED BY "thesis-management".announcements.id;
          thesis-management          admin    false    225            �            1259    16430 
   committees    TABLE     �  CREATE TABLE "thesis-management".committees (
    id integer NOT NULL,
    thesis_id integer,
    member_id integer,
    role character varying(50) NOT NULL,
    invite_status character varying(50) DEFAULT 'invited'::character varying,
    invite_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    response_date timestamp without time zone,
    CONSTRAINT committees_invite_status_check CHECK (((invite_status)::text = ANY ((ARRAY['invited'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT committees_role_check CHECK (((role)::text = ANY ((ARRAY['supervisor'::character varying, 'member'::character varying])::text[])))
);
 +   DROP TABLE "thesis-management".committees;
       thesis-management         heap    admin    false    6            �            1259    16429    committees_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".committees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE "thesis-management".committees_id_seq;
       thesis-management          admin    false    220    6            z           0    0    committees_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE "thesis-management".committees_id_seq OWNED BY "thesis-management".committees.id;
          thesis-management          admin    false    219            �            1259    16469    grades    TABLE     >  CREATE TABLE "thesis-management".grades (
    id integer NOT NULL,
    thesis_id integer,
    member_id integer,
    grade numeric(4,2) NOT NULL,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT grades_grade_check CHECK (((grade >= (0)::numeric) AND (grade <= (100)::numeric)))
);
 '   DROP TABLE "thesis-management".grades;
       thesis-management         heap    admin    false    6            �            1259    16468    grades_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE "thesis-management".grades_id_seq;
       thesis-management          admin    false    224    6            {           0    0    grades_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE "thesis-management".grades_id_seq OWNED BY "thesis-management".grades.id;
          thesis-management          admin    false    223            �            1259    16448    progress    TABLE       CREATE TABLE "thesis-management".progress (
    id integer NOT NULL,
    thesis_id integer,
    instructor_id integer,
    note text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT progress_note_check CHECK ((length(note) <= 300))
);
 )   DROP TABLE "thesis-management".progress;
       thesis-management         heap    admin    false    6            �            1259    16447    progress_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE "thesis-management".progress_id_seq;
       thesis-management          admin    false    6    222            |           0    0    progress_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE "thesis-management".progress_id_seq OWNED BY "thesis-management".progress.id;
          thesis-management          admin    false    221            �            1259    16410    theses    TABLE     W  CREATE TABLE "thesis-management".theses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    detailed_file text,
    student_id integer,
    supervisor_id integer,
    status character varying(50) NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    CONSTRAINT theses_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'under_assignment'::character varying, 'under_examination'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);
 '   DROP TABLE "thesis-management".theses;
       thesis-management         heap    admin    false    6            �            1259    16409    theses_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".theses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE "thesis-management".theses_id_seq;
       thesis-management          admin    false    6    218            }           0    0    theses_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE "thesis-management".theses_id_seq OWNED BY "thesis-management".theses.id;
          thesis-management          admin    false    217            �            1259    16498    thesis_material    TABLE     g  CREATE TABLE "thesis-management".thesis_material (
    id integer NOT NULL,
    thesis_id integer,
    file_url text,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    additional_material text,
    exam_date timestamp without time zone,
    exam_details text,
    library_link character varying(255),
    exam_report_file_url text
);
 0   DROP TABLE "thesis-management".thesis_material;
       thesis-management         heap    admin    false    6            �            1259    16497    thesis_material_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".thesis_material_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE "thesis-management".thesis_material_id_seq;
       thesis-management          admin    false    6    228            ~           0    0    thesis_material_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE "thesis-management".thesis_material_id_seq OWNED BY "thesis-management".thesis_material.id;
          thesis-management          admin    false    227            �            1259    16398    users    TABLE     L  CREATE TABLE "thesis-management".users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    role "thesis-management".user_role NOT NULL,
    password_hash text NOT NULL,
    contact_details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 &   DROP TABLE "thesis-management".users;
       thesis-management         heap    admin    false    6    851            �            1259    16397    users_id_seq    SEQUENCE     �   CREATE SEQUENCE "thesis-management".users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE "thesis-management".users_id_seq;
       thesis-management          admin    false    216    6                       0    0    users_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE "thesis-management".users_id_seq OWNED BY "thesis-management".users.id;
          thesis-management          admin    false    215            �           2604    16491    announcements id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".announcements ALTER COLUMN id SET DEFAULT nextval('"thesis-management".announcements_id_seq'::regclass);
 L   ALTER TABLE "thesis-management".announcements ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    225    226    226            �           2604    16433    committees id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".committees ALTER COLUMN id SET DEFAULT nextval('"thesis-management".committees_id_seq'::regclass);
 I   ALTER TABLE "thesis-management".committees ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    220    219    220            �           2604    16472 	   grades id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".grades ALTER COLUMN id SET DEFAULT nextval('"thesis-management".grades_id_seq'::regclass);
 E   ALTER TABLE "thesis-management".grades ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    224    223    224            �           2604    16451    progress id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".progress ALTER COLUMN id SET DEFAULT nextval('"thesis-management".progress_id_seq'::regclass);
 G   ALTER TABLE "thesis-management".progress ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    221    222    222            �           2604    16413 	   theses id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".theses ALTER COLUMN id SET DEFAULT nextval('"thesis-management".theses_id_seq'::regclass);
 E   ALTER TABLE "thesis-management".theses ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    217    218    218            �           2604    16501    thesis_material id    DEFAULT     �   ALTER TABLE ONLY "thesis-management".thesis_material ALTER COLUMN id SET DEFAULT nextval('"thesis-management".thesis_material_id_seq'::regclass);
 N   ALTER TABLE "thesis-management".thesis_material ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    227    228    228            �           2604    16401    users id    DEFAULT     ~   ALTER TABLE ONLY "thesis-management".users ALTER COLUMN id SET DEFAULT nextval('"thesis-management".users_id_seq'::regclass);
 D   ALTER TABLE "thesis-management".users ALTER COLUMN id DROP DEFAULT;
       thesis-management          admin    false    215    216    216            o          0    16488    announcements 
   TABLE DATA           g   COPY "thesis-management".announcements (id, title, content, presentation_date, created_at) FROM stdin;
    thesis-management          admin    false    226   �i       i          0    16430 
   committees 
   TABLE DATA           |   COPY "thesis-management".committees (id, thesis_id, member_id, role, invite_status, invite_date, response_date) FROM stdin;
    thesis-management          admin    false    220   vj       m          0    16469    grades 
   TABLE DATA           [   COPY "thesis-management".grades (id, thesis_id, member_id, grade, recorded_at) FROM stdin;
    thesis-management          admin    false    224   �j       k          0    16448    progress 
   TABLE DATA           _   COPY "thesis-management".progress (id, thesis_id, instructor_id, note, created_at) FROM stdin;
    thesis-management          admin    false    222   �k       g          0    16410    theses 
   TABLE DATA           �   COPY "thesis-management".theses (id, title, description, detailed_file, student_id, supervisor_id, status, started_at, completed_at) FROM stdin;
    thesis-management          admin    false    218   �k       q          0    16498    thesis_material 
   TABLE DATA           �   COPY "thesis-management".thesis_material (id, thesis_id, file_url, uploaded_at, additional_material, exam_date, exam_details, library_link, exam_report_file_url) FROM stdin;
    thesis-management          admin    false    228   �p       e          0    16398    users 
   TABLE DATA           o   COPY "thesis-management".users (id, name, email, role, password_hash, contact_details, created_at) FROM stdin;
    thesis-management          admin    false    216   �p       �           0    0    announcements_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('"thesis-management".announcements_id_seq', 2, true);
          thesis-management          admin    false    225            �           0    0    committees_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('"thesis-management".committees_id_seq', 33, true);
          thesis-management          admin    false    219            �           0    0    grades_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('"thesis-management".grades_id_seq', 17, true);
          thesis-management          admin    false    223            �           0    0    progress_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('"thesis-management".progress_id_seq', 2, true);
          thesis-management          admin    false    221            �           0    0    theses_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('"thesis-management".theses_id_seq', 52, true);
          thesis-management          admin    false    217            �           0    0    thesis_material_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('"thesis-management".thesis_material_id_seq', 5, true);
          thesis-management          admin    false    227            �           0    0    users_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('"thesis-management".users_id_seq', 9, true);
          thesis-management          admin    false    215            �           2606    16496     announcements announcements_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY "thesis-management".announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);
 W   ALTER TABLE ONLY "thesis-management".announcements DROP CONSTRAINT announcements_pkey;
       thesis-management            admin    false    226            �           2606    16436    committees committees_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);
 Q   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT committees_pkey;
       thesis-management            admin    false    220            �           2606    16476    grades grades_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);
 I   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT grades_pkey;
       thesis-management            admin    false    224            �           2606    16457    progress progress_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);
 M   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT progress_pkey;
       thesis-management            admin    false    222            �           2606    16418    theses theses_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT theses_pkey PRIMARY KEY (id);
 I   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT theses_pkey;
       thesis-management            admin    false    218            �           2606    16507 $   thesis_material thesis_material_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY "thesis-management".thesis_material
    ADD CONSTRAINT thesis_material_pkey PRIMARY KEY (id);
 [   ALTER TABLE ONLY "thesis-management".thesis_material DROP CONSTRAINT thesis_material_pkey;
       thesis-management            admin    false    228            �           2606    16408    users users_email_key 
   CONSTRAINT     ^   ALTER TABLE ONLY "thesis-management".users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 L   ALTER TABLE ONLY "thesis-management".users DROP CONSTRAINT users_email_key;
       thesis-management            admin    false    216            �           2606    16406    users users_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY "thesis-management".users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 G   ALTER TABLE ONLY "thesis-management".users DROP CONSTRAINT users_pkey;
       thesis-management            admin    false    216            �           2606    16442 $   committees committees_member_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT committees_member_id_fkey FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT committees_member_id_fkey;
       thesis-management          admin    false    216    3255    220            �           2606    16437 $   committees committees_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT committees_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT committees_thesis_id_fkey;
       thesis-management          admin    false    3257    220    218            �           2606    16529    committees fk_committees_member    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT fk_committees_member FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT fk_committees_member;
       thesis-management          admin    false    220    216    3255            �           2606    16524    committees fk_committees_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".committees
    ADD CONSTRAINT fk_committees_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY "thesis-management".committees DROP CONSTRAINT fk_committees_thesis;
       thesis-management          admin    false    3257    218    220            �           2606    16549    grades fk_grades_member    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT fk_grades_member FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT fk_grades_member;
       thesis-management          admin    false    3255    216    224            �           2606    16544    grades fk_grades_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT fk_grades_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT fk_grades_thesis;
       thesis-management          admin    false    3257    224    218            �           2606    16539    progress fk_progress_instructor    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT fk_progress_instructor FOREIGN KEY (instructor_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT fk_progress_instructor;
       thesis-management          admin    false    216    222    3255            �           2606    16534    progress fk_progress_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT fk_progress_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT fk_progress_thesis;
       thesis-management          admin    false    218    3257    222            �           2606    16514    theses fk_theses_student    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT fk_theses_student FOREIGN KEY (student_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 O   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT fk_theses_student;
       thesis-management          admin    false    218    216    3255            �           2606    16519    theses fk_theses_supervisor    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT fk_theses_supervisor FOREIGN KEY (supervisor_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 R   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT fk_theses_supervisor;
       thesis-management          admin    false    216    3255    218            �           2606    16554 )   thesis_material fk_thesis_material_thesis    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".thesis_material
    ADD CONSTRAINT fk_thesis_material_thesis FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 `   ALTER TABLE ONLY "thesis-management".thesis_material DROP CONSTRAINT fk_thesis_material_thesis;
       thesis-management          admin    false    228    218    3257            �           2606    16482    grades grades_member_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT grades_member_id_fkey FOREIGN KEY (member_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 S   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT grades_member_id_fkey;
       thesis-management          admin    false    216    224    3255            �           2606    16477    grades grades_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".grades
    ADD CONSTRAINT grades_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 S   ALTER TABLE ONLY "thesis-management".grades DROP CONSTRAINT grades_thesis_id_fkey;
       thesis-management          admin    false    224    218    3257            �           2606    16463 $   progress progress_instructor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT progress_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES "thesis-management".users(id) ON DELETE CASCADE;
 [   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT progress_instructor_id_fkey;
       thesis-management          admin    false    216    222    3255            �           2606    16458     progress progress_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".progress
    ADD CONSTRAINT progress_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY "thesis-management".progress DROP CONSTRAINT progress_thesis_id_fkey;
       thesis-management          admin    false    218    3257    222            �           2606    16419    theses theses_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT theses_student_id_fkey FOREIGN KEY (student_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 T   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT theses_student_id_fkey;
       thesis-management          admin    false    216    218    3255            �           2606    16424     theses theses_supervisor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".theses
    ADD CONSTRAINT theses_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES "thesis-management".users(id) ON DELETE SET NULL;
 W   ALTER TABLE ONLY "thesis-management".theses DROP CONSTRAINT theses_supervisor_id_fkey;
       thesis-management          admin    false    218    216    3255            �           2606    16508 .   thesis_material thesis_material_thesis_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY "thesis-management".thesis_material
    ADD CONSTRAINT thesis_material_thesis_id_fkey FOREIGN KEY (thesis_id) REFERENCES "thesis-management".theses(id) ON DELETE CASCADE;
 e   ALTER TABLE ONLY "thesis-management".thesis_material DROP CONSTRAINT thesis_material_thesis_id_fkey;
       thesis-management          admin    false    228    218    3257            o   |   x�3��H-�,V(J-N�+I,���S0��* �'g���椦( 9.��
��%z�FF&��F���
�V 3�5�P04�2��25�34�047�2�j'\Ԉ��F�v(��3F��� ��A�      i   U   x�32��4��M�MJ-�LLNN-(IM�4202�54�5�T0��25�22Գ04311���2�j2�i��+�$B�P�)izb���� |�%�      m   �   x�U��� �K4��k�`�����:�xz4;4h���*jyiT>���^��!���R&}���@/a��&x@CZN@���.����h���'��� �JL݆�8 �l���e#��S��72�$�o�\?G�e�p�����.�|�/9%      k      x������ � �      g   $  x��V�n�8]+_�ݴ@lX�e�޵IH�`��l�tm��H���:_�CR~��0���sIt�$#S�ݒ�(�r~�F+�
U�eɌ�7ץ�f�Q�Q+K����Br+���A2��q/�Y<���4N��d2�r�9���J�bɅds��g*ZM�$i�ݲ.��j��ߛJ�]k15g��˖��T�Zl�U���-1㭝��
XмOT2�3�&-��2�5�j�w����pc�Bz�!����YO���`؏G�0�T�8zwջS�pqG�(���&��C�sp�X� i�l�2�gĺ�J5ΥK�K�Mg�ڙ
����98���	�JZg��E���.��k���ґE�� U�|;va��\ԏ.���G��T4�]�YY��f�m|T �S��7��H�����l0���l��NO\��4g��ߔ�(��4˧I��&i�ƞ�at�m��5���ٝV� |s{}���� �L[Gt��j��oZژ��\��bU�x�T;�&�t�����#/�΋^���]xPmG�㜷x����ʁ1�Q�ȋ�5�+��M"�����i�+�_����%!�].�G�w�t5d��/�B�^˸������e��y�"�� �p�
o��� ����w �t?�=ͥQ���⹵�4����<�,z�'��#
K�ۊ�����*�x�g�A��t�>{���?�븝v���ۦ�Bo4�Vk��v�hv����w�)T�T���9���C�[�r]��*�����i؝ҖW��ީv�"�D�ԙx
��O���,�M��c&r.���k������j���K��\�w�Hx��Cx�\*� � [:W�vZ��*���˒ņ��SZ:��d�vM�p�����|@M��q�\o?Ř�0�?��U�?��g�m��+E�n{<tݴƛ��:��zJ�Ћ�qW�k��>�0��8u�Z�(*7����f)*b5,ڎa���%�h]�W}�d�����O���i}�K�ʗR7��K�ݕS�%���_Q]�[�����G���`��Z���a�OV�.���n���A&v���B�º ���<�EM��=
�FH��\�|=8�BK��WF=g�ɸwz����4ͧ�?O�A�[bM�'$��g�C��\[�H��@u�%��-���G�7�
ţ��aW�ޕ����`{։���.�o�u���m��/�>̹sJ�B+��9�^鬕j������uq�w��k��y���������_�l�?;;�=�v�      q      x������ � �      e   A  x�ՕKo�@��ï!/�<�l�MZ+Qܦi����2.��R�{gvjlE�,uřр�w�r.#��B8̳��Z[����\�2-� K@�A�dw&����?�V�G�W.��&Wl����ǳ��۵�\D����I�پ���d.fY*�49g�RB06��L2?��}�3J0�=�-�0�E������(�ֲ�������	B'؅����c�"�1��H�u�3 ��
-w���(�UPf��a!�1!�2���5X�2?��g�KYv��&�ra��D)�)d����2�e)�H�7��n	�/����/��,#�#�b.�<f0��/c�d���m��k�e���{��R�kU��`��~�7w�F�M��*u"8�2�~�<�oB����7GH��NyP�>V��S���W2K�,�\���5І�(��2�f�#L��R����u�i�No�P�	�p���3p�(���,*%��u��21ƹ㸮׀Ҙ�nP�$��(f�BuuVa�GF���6U�[�g�*�&�9ߥ�n� �N�K��e�s]X���.���� ���Z��ށ-O��a #ĸg     